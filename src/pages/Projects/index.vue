<template>
  <fragment>
    <q-breadcrumbs>
      <q-breadcrumbs-el icon="las la-home" to="/" />
      <q-breadcrumbs-el label="Projects" />
    </q-breadcrumbs>

    <q-card>
      <q-card-section>
        <q-btn-group flat>
          <q-btn color="primary" label="New" flat icon="las la-plus" v-on:click="showCreate = !showCreate" />
        </q-btn-group>
      </q-card-section>
      <q-card-section>
        <q-item v-if="list.length === 0">
          <q-item-section>
            <q-item-label>No data.</q-item-label>
          </q-item-section>
        </q-item>
        <q-virtual-scroll style="max-height: 100%" :items="list" separator>
          <template v-slot="{ item, index }">
            <q-item :key="index" clickable>
              <q-item-section>
                <q-item-label>#{{ index }} - {{ capitalize(item.name) }}</q-item-label>
                <q-item-label caption>{{ item.path }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn-group flat>
                  <q-btn flat color="primary" icon="las la-pen" v-on:click="editProject(item)" />
                  <q-btn flat color="red" icon="las la-trash" v-on:click="deleteProject(item)" />
                </q-btn-group>
              </q-item-section>
            </q-item>
          </template>
        </q-virtual-scroll>
      </q-card-section>
    </q-card>

    <!--    -->
    <q-dialog v-model="showCreate" v-on:hide="resetForm">
      <q-card style="max-width: 80%; width: 600px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">
            {{ showEdit ? "Edit Project" : "New Project" }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <form @submit.prevent.stop="onSubmit" class="q-gutter-md">
            <q-input
              ref="name"
              v-model="projectData.name"
              label="Name"
              autofocus
              clearable
              :rules="[(val) => (val && val.length > 0) || 'Please type something']"
            />
            <q-input
              ref="path"
              v-model="projectData.path"
              label="Path"
              clearable
              :rules="[
                (val) => (val && val.length > 0) || 'Please type something',
                (val) => fileExists(val) || 'Directory does not exist',
              ]"
            >
              <template v-slot:append>
                <q-btn flat icon="las la-folder-plus" color="primary" v-on:click="selectFolder" />
              </template>
            </q-input>
            <div>
              <q-btn label="Submit" type="submit" color="primary" />
            </div>
          </form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </fragment>
</template>

<script>
import { format, LocalStorage } from "quasar";
import { v4 } from "uuid";
import _ from "lodash";

const fs = require("fs-extra");
const { dialog } = require("electron").remote;
const homedir = require("os").homedir();
const { capitalize } = format;

export default {
  name: "ProjectsPage",
  data() {
    return {
      list: LocalStorage.getItem("projects") || [],
      showCreate: false,
      projectData: {
        name: null,
        path: null,
        id: v4(),
      },
      defaultOpenDirectory: homedir,
      showEdit: false,
    };
  },
  watch: {
    list() {
      LocalStorage.set("projects", this.list);
    },
  },
  methods: {
    onSubmit() {
      this.$refs.name.validate();
      this.$refs.path.validate();
      if (this.$refs.name.hasError || this.$refs.path.hasError) return;
      let list = _.cloneDeep(this.list);
      let index = _.findIndex(list, (v) => v.id === this.projectData.id);
      console.log(index);
      if (index === -1) {
        list.push(_.cloneDeep(this.projectData));
      } else {
        list[index] = _.cloneDeep(this.projectData);
      }
      this.list = list;
      this.$q.notify({
        icon: "done",
        color: "positive",
        message: this.showEdit ? "Project edited." : "Project created.",
      });
      this.resetForm();
      this.showCreate = false;
      this.showEdit = false;
    },
    resetForm() {
      this.projectData = {
        name: null,
        path: null,
        id: v4(),
      };
    },
    fileExists(path) {
      return fs.pathExistsSync(path) && fs.lstatSync(path).isDirectory();
    },
    selectFolder() {
      dialog
        .showOpenDialog({
          properties: ["openDirectory"],
          defaultPath: this.defaultOpenDirectory,
        })
        .then((result) => {
          if (result.canceled) return;
          if (result.filePaths.length > 0) {
            this.projectData.path = result.filePaths[0];
          }
        });
    },
    capitalize,
    editProject(data) {
      this.projectData = _.cloneDeep(data);
      this.showEdit = true;
      this.showCreate = true;
    },
    deleteProject(data) {
      this.$q
        .dialog({
          title: "Confirm",
          message: "Are you sure?",
          cancel: true,
          persistent: true,
        })
        .onOk(() => {
          let index = _.findIndex(this.list, (v) => v.id === data.id);
          if (index !== -1) {
            let list = _.cloneDeep(this.list);
            list.splice(index, 1);
            this.list = list;
          }
          this.$q.notify({
            icon: "done",
            color: "positive",
            message: "Project deleted.",
          });
        });
    },
  },
};
</script>

<style scoped></style>
