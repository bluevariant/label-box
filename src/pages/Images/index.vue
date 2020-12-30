<template>
  <fragment>
    <q-breadcrumbs>
      <q-breadcrumbs-el icon="las la-home" to="/" />
      <q-breadcrumbs-el label="Projects" to="/projects" />
      <q-breadcrumbs-el v-bind:label="$route.query.name" />
    </q-breadcrumbs>

    <q-card>
      <q-card-section>
        <div class="q-gutter-xs justify-center items-center" style="height: 70px">
          <q-input
            dense
            v-model="filter"
            label="Search"
            clearable
            @focus="(e) => e.target.select()"
            style="width: 300px"
            class="inline-block q-mr-md"
          />
          <q-btn
            flat
            v-if="ticked.length > 0"
            @click.stop="ticked = []"
            color="negative"
            icon-right="las la-times"
          >
            {{ ticked.length }} Ticked
            <q-tooltip>Untick</q-tooltip>
          </q-btn>
          <q-btn flat v-if="ticked.length > 0" color="primary" @click.stop="resize">Resize</q-btn>
        </div>
      </q-card-section>
      <q-card-section>
        <q-item v-if="items.length === 0">
          <q-item-section>
            <q-item-label>{{ loaded ? "No data." : "" }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-virtual-scroll style="max-height: calc(100vh - 250px)" :items="items" separator>
          <template v-slot="{ item, index }">
            <q-tree
              :key="index"
              :nodes="[item]"
              node-key="id"
              tick-strategy="leaf"
              :ticked.sync="ticked"
              :expanded.sync="expanded"
              :filter="filter"
            >
              <template v-slot:header-file="prop">
                <div>
                  <img
                    :src="prop.node.path"
                    class="avatar q-mr-sm"
                    alt="thumbnail"
                    style="max-height: 100px; max-width: 100px"
                    @click="openImage(prop.node.path)"
                  />
                  <div>
                    {{ prop.node.label }}
                  </div>
                </div>
              </template>
            </q-tree>
          </template>
        </q-virtual-scroll>
      </q-card-section>
    </q-card>
  </fragment>
</template>

<script>
import readDir from "src/utils/readDir";
import _ from "lodash";
import jimp from "jimp";

const path = require("path");
const fs = require("fs-extra");
const { shell } = require("electron").remote;

function getDefaultData(self) {
  return {
    items: [],
    loaded: false,
    ticked: [],
    expanded: [],
    filter: "",
  };
}

export default {
  name: "ImagesPage",
  data() {
    return getDefaultData(this);
  },
  mounted() {
    this.loadTree();
  },
  methods: {
    openImage(path) {
      if (path.endsWith(".gif")) {
        window.open(path, "_blank");
      } else shell.openPath(path);
    },
    resize() {
      this.$q
        .dialog({
          title: "Prompt",
          message: "Size",
          prompt: {
            model: 640,
            type: "number",
            attrs: {
              onfocus: (e) => e.target.select(),
            },
            suffix: "px",
          },
          cancel: true,
          persistent: true,
        })
        .onOk(async (size) => {
          this.$q.loading.show();
          for (let fileId of this.ticked) {
            let filePath = path.join(this.$route.query.path || "", fileId);
            let image = await jimp.read(filePath);
            if (image.getWidth() > image.getHeight()) {
              await image.resize(size, jimp.AUTO);
            } else {
              await image.resize(jimp.AUTO, size);
            }
            await image.writeAsync(filePath);
            console.log("resized: " + fileId);
          }
          this.$q.loading.hide();
        });
    },
    loadTree() {
      this.$q.loading.show();
      readDir(this.$route.query.path).then((files) => {
        let items = _.filter(files, (file) => {
          let whiteExtensions = ["png", "jpg", "gif", "jpeg"];
          for (let ext of whiteExtensions) {
            if (file.endsWith("." + ext)) return true;
          }
          return false;
        });
        let dataset = [];
        let ids = {};
        _.forEach(items, (fullPath) => {
          let filePath = path
            .relative(this.$route.query.path || "", fullPath.toString())
            .replace(/\\/g, "/");
          let splitedPath = filePath.split("/");
          while (splitedPath.length > 0) {
            let fileId = splitedPath.join("/");
            if (!ids[fileId]) {
              let flatItem = {
                id: fileId,
                label: splitedPath[splitedPath.length - 1],
                path: fullPath,
                isFile: fs.lstatSync(path.join(this.$route.query.path || "", fileId)).isFile(),
              };
              splitedPath.pop();
              if (splitedPath.length > 0) {
                flatItem.parentId = splitedPath.join("/");
              }
              if (flatItem.isFile) {
                flatItem.header = "file";
              }
              dataset.push(flatItem);
              ids[fileId] = true;
            } else {
              splitedPath.pop();
            }
          }
        });
        this.items = Object.freeze(listToTree(dataset));
        console.log(this.items);
        this.$q.loading.hide();
        this.loaded = true;
      });
    },
  },
};

function listToTree(dataset) {
  // https://stackoverflow.com/a/40732240/6435579
  const hashTable = {};
  dataset.forEach((aData) => (hashTable[aData.id] = { ...aData, children: [] }));
  const dataTree = [];
  dataset.forEach((aData) => {
    if (aData.parentId) hashTable[aData.parentId].children.push(hashTable[aData.id]);
    else dataTree.push(hashTable[aData.id]);
  });
  return dataTree;
}
</script>

<style scoped></style>
