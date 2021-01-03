<template>
  <q-page padding class="q-gutter-md">
    <q-breadcrumbs>
      <q-breadcrumbs-el icon="las la-home" to="/" />
      <q-breadcrumbs-el label="Projects" to="/projects" />
      <q-breadcrumbs-el :label="$route.query.name" />
    </q-breadcrumbs>
    <q-card>
      <q-card-section>
        <div class="row">
          <div class="col-3 left-side">
            <div class="row q-col-gutter-sm">
              <div class="col-6" v-for="(src, index) in images" :key="index">
                <div :class="selected === index ? 'active' : 'no-active'" @click="selected = index">
                  <img :src="src" alt="thumbnail" class="thumbnail" />
                </div>
              </div>
            </div>
          </div>
          <div class="col-9">Hello</div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import readDir from "src/utils/readDir";
import _ from "lodash";

const path = require("path");
const fs = require("fs-extra");

function data(self) {
  return {
    loading: false,
    images: [],
    selected: -1,
    labels: {},
  };
}

export default {
  name: "index",
  data() {
    return data(this);
  },
  mounted() {
    document.body.style.overflow = "hidden";
    this.loadImages();
  },
  beforeDestroy() {
    document.body.style.overflow = "auto";
  },
  methods: {
    loadImages() {
      this.loading = true;
      readDir(this.$route.query.path).then(async (files) => {
        this.images = _.filter(files, (file) => {
          console.log(path.basename(file));
          let whiteExtensions = ["png", "jpg", "gif", "jpeg"];
          for (let ext of whiteExtensions) {
            if (file.endsWith("." + ext)) return true;
          }
          return false;
        });

        if (this.images.length > 0) this.selected = 0;

        let labelFiles = files.filter((file) => path.basename(file) === "labels.txt");
        let labels = {};

        for (let file of labelFiles) {
          let dir = path.dirname(file);
          labels[dir] = (await fs.readFile(file, "UTF-8"))
            .split("\n")
            .map((v) => v.trim())
            .filter((v) => v.length > 0);
        }

        this.labels = labels;
        this.loading = false;
      });
    },
  },
};
</script>

<style scoped>
.thumbnail {
  width: 100%;
  height: auto;
  display: block;
  cursor: pointer;
}

.active {
  border: 4px solid var(--q-color-primary);
  opacity: 1;
}

.no-active {
  opacity: 0.5;
}

.left-side {
  height: calc(100vh - 160px);
  overflow-y: auto;
}
</style>
