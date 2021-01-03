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
                  :class="
                    selected === index ? 'active' : saved[src] ? 'no-active-saved' : 'no-active'
                  "
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
            <div class="right-side items-center justify-center flex" style="position: relative">
              <span class="text-white inline-block image-container relative-position">
                <img v-if="selected >= 0" :src="images[selected]" alt="thumbnail" />
                <div class="rect-container text-white">
                  <draw-rect
                    v-for="(rect, index) in rectItems"
                    :key="index"
                    :data="rect"
                    :index="index"
                  />
                  <make-rect :onAdd="onAddRect" />
                </div>
              </span>
              <div
                :style="{ position: 'absolute', top: 0, left: 0, width: '100%' }"
                class="text-white m-chips text-center"
              >
                <q-chip
                  square
                  v-for="(chip, index) in labelOptions"
                  dense
                  :icon="'lar la-bookmark'"
                  :key="index"
                  :color="chip.value === selectedLabel ? 'primary' : ''"
                  @click="selectLabel(index)"
                  clickable
                >
                  {{ chip.label }}
                </q-chip>
              </div>
              <div
                :style="{ position: 'absolute', bottom: 0, left: 0, width: '100%' }"
                class="text-white m-chips text-center"
              >
                <q-chip
                  square
                  v-for="(chip, index) in rectItems"
                  dense
                  :icon="'las la-trash'"
                  :key="index"
                  clickable
                  @click="(e) => deleteRect(e, index)"
                >
                  #{{ index + 1 }} {{ chip.label }}
                </q-chip>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import Rect from "../../components/Rect";
import MakeRect from "../../components/MakeRect";
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
    currentLabels: [],
    selectedLabel: 0,
    saved: {},
  };
}

export default {
  name: "PageLabeling",
  components: { "draw-rect": Rect, "make-rect": MakeRect },
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
        this.saveLabels();

        let label = path.basename(this.images[this.selected]).split(".").shift().split("_")[0];
        if (this.currentLabels.includes(label)) {
          this.selectedLabel = this.currentLabels.indexOf(label);
        }
      });
    },
    images() {},
  },
  computed: {
    labelOptions() {
      return this.currentLabels.map((v, i) => ({
        label: v,
        value: i,
      }));
    },
  },
  methods: {
    loadImages() {
      this.loading = true;
      readDir(this.$route.query.path).then(async (files) => {
        files.sort((a, b) => {
          return path.basename(a).localeCompare(path.basename(b));
        });
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
      this.currentLabels = labels;
      let result = [];
      let labelFile = this.getLabelFile(src);
      let content;

      if (await fs.pathExists(labelFile)) {
        content = await fs.readFile(labelFile, "UTF-8");
      } else if (await fs.pathExists(preFile)) {
        content = await fs.readFile(preFile, "UTF-8");
      }

      if (content) {
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
            let final = {
              label: labels[labelIndex],
              labelIndex,
              box: [v[1], v[2], v[3], v[4]],
              weight: v[5],
            };
            if (v.length < 6) delete final.weight;
            return final;
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
    onAddRect(box) {
      let items = _.cloneDeep(this.rectItems);
      items.push({
        box,
        label: this.currentLabels[this.selectedLabel],
        labelIndex: this.selectedLabel,
      });
      this.rectItems = items;
      this.saveLabels();
    },
    selectLabel(index) {
      this.selectedLabel = index;
    },
    getLabelFile(src) {
      let labelDir = path.join(src, "../../", "labels");
      let labelFile = path.join(labelDir, path.basename(src));
      labelFile = labelFile.split(".");
      labelFile.pop();
      labelFile.push("txt");
      labelFile = labelFile.join(".");
      return labelFile;
    },
    async saveLabels() {
      let labelFile = this.getLabelFile(this.images[this.selected]);
      let saveContent = this.rectItems
        .map((v) => {
          return [v.labelIndex, ...v.box]
            .map((v) => parseFloat(parseFloat(v).toFixed(6)))
            .join(" ");
        })
        .join("\n");
      await fs.ensureFileSync(labelFile);
      await fs.writeFile(labelFile, saveContent);
      await this.updateSaved();
    },
    async updateSaved() {
      let saved = _.cloneDeep(this.saved);
      for (let src of this.images) {
        if (!saved[src]) {
          saved[src] = await fs.pathExists(this.getLabelFile(src));
        }
      }
      this.saved = saved;
    },
    deleteRect(e, index) {
      let items = _.cloneDeep(this.rectItems);
      if (e.shiftKey || e.ctrlKey) {
        items[index].labelIndex = this.selectedLabel;
        items[index].label = this.currentLabels[this.selectedLabel];
      } else {
        items.splice(index, 1);
      }
      this.rectItems = items;
      this.saveLabels();
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

.no-active-saved {
  border: 4px solid green;
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
  max-height: calc(100vh - 255px);
  max-width: 100%;
  pointer-events: none;
  border: 1px solid #ffffff;
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

.m-chips {
  overflow-x: auto;
  white-space: nowrap;
}
</style>
