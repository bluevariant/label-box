<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="las la-bars"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />
        <q-toolbar-title />
        <q-item tag="a" class="items-center" v-on:click="openMyGithub">
          <q-avatar>
            <img src="../assets/face.png" alt="logo" />
          </q-avatar>
          @bluevariant
        </q-item>
      </q-toolbar>
    </q-header>
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered content-class="bg-grey-1">
      <q-list>
        <q-item-label header class="text-grey-8">Label Enhancer</q-item-label>
        <EssentialLink v-for="link in essentialLinks" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import EssentialLink from "components/EssentialLink.vue";

const { shell } = require("electron").remote;

const linksData = [
  {
    title: "Projects",
    caption: "Manage your Projects",
    icon: "las la-folder-open",
    link: "/projects",
  },
  {
    title: "YOLO label",
    caption: "Image Labeling for YOLO",
    icon: "las la-otter",
    link: "/yolo-label",
  },
  {
    title: "Random background",
    caption: "Merge sample to rand bg",
    icon: "las la-icons",
    link: "/random-background",
  },
  {
    title: "Labels",
    caption: "Manage your labels",
    icon: "las la-tag",
    link: "labels",
  },
];

export default {
  name: "MainLayout",
  components: { EssentialLink },
  data() {
    return {
      leftDrawerOpen: false,
      essentialLinks: linksData,
    };
  },
  methods: {
    openMyGithub() {
      shell.openExternal("https://github.com/bluevariant");
    },
  },
};
</script>
