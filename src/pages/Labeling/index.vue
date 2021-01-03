<template>
  <q-page padding class="q-gutter-md user-select-none">
    <q-breadcrumbs>
      <q-breadcrumbs-el icon="las la-home" to="/" />
      <q-breadcrumbs-el label="Projects" to="/projects" />
      <q-breadcrumbs-el :label="$route.query.name" />
    </q-breadcrumbs>
    <q-card>
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-3 left-side q-mt-md q-pt-none">
            <div class="row q-col-gutter-sm">
              <div
                class="col-6"
                v-for="(src, index) in images"
                :key="index"
                @click="selected = index"
              >
                <div
                  class="items-center justify-center flex bg-black"
                  :class="selected === index ? 'active' : 'no-active'"
                  style="height: 100%; width: 100%"
                >
                  <span class="inline-block">
                    <img :src="src" alt="thumbnail" class="thumbnail block" />
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="col-9">
            <div class="right-side items-center justify-center flex">
              <span class="text-white inline-block image-container">
                <img v-if="selected >= 0" :src="images[selected]" alt="thumbnail" />
              </span>
            </div>
          </div>
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
  name: "PageLabeling",
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
}

.active img {
  opacity: 1;
}

.no-active {
  border: 4px solid rgba(0, 0, 0, 0.1);
}

.no-active img {
  opacity: 0.5;
}

.left-side {
  height: calc(100vh - 155px);
  overflow-y: auto;
}

.right-side {
  width: 100%;
  height: 100%;
  background: #000000;
}

.image-container {
  max-width: 100%;
  max-height: 100%;
}

.image-container img {
  display: block;
  max-height: calc(100vh - 155px);
  max-width: 100%;
  pointer-events: none;
}

.user-select-none {
  user-select: none;
}
</style>
