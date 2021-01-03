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
              <span class="text-white inline-block image-container relative-position">
                <img v-if="selected >= 0" :src="images[selected]" alt="thumbnail" />
                <div class="rect-container text-white">
                  <draw-rect
                    v-for="(rect, index) in rectItems"
                    :key="index"
                    :data="rect"
                    :index="index"
                  />
                </div>
              </span>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import Rect from "../../components/Rect";
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
    rectItems: [],
  };
}

export default {
  name: "PageLabeling",
  components: { "draw-rect": Rect },
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
  watch: {
    selected() {
      if (this.selected < 0) return;

      this.rectItems = [];
      this.readPre(this.images[this.selected]).then((result) => {
        this.rectItems = result;
      });
    },
  },
  methods: {
    loadImages() {
      this.loading = true;
      readDir(this.$route.query.path).then(async (files) => {
        this.images = _.filter(files, (file) => {
          let whiteExtensions = ["png", "jpg", "gif", "jpeg"];

          for (let ext of whiteExtensions) {
            if (file.endsWith("." + ext)) return true;
          }

          return false;
        });

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

        if (this.images.length > 0) this.selected = 0;

        this.loading = false;
      });
    },
    async readPre(src) {
      let preFile = src + ".pre";
      let labels = this.getLabels(src);
      let result = [];

      if (await fs.pathExists(preFile)) {
        let content = await fs.readFile(preFile, "UTF-8");
        // 14 0.3947916626930237 0.7510416507720947 0.21041665971279144 0.16458334028720856 0.8662109375
        result = content
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.length > 0)
          .map((v) => {
            v = v
              .split(" ")
              .map((v) => v.trim())
              .filter((v) => v.length > 0)
              .map((v) => +v);
            let labelIndex = v[0];
            return {
              label: labels[labelIndex],
              labelIndex,
              box: [v[1], v[2], v[3], v[4]],
              weight: v[5],
            };
          });
      }
      return result;
    },
    getLabels(src) {
      let keys = Object.keys(this.labels);
      let dir = path.dirname(src);
      let index = _.findIndex(keys, (v) => dir.startsWith(v));

      if (index >= 0) return this.labels[keys[index]];

      return [];
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
  overflow-y: scroll;
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

.rect-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
