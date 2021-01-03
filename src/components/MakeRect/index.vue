<template>
  <div
    ref="container"
    class="m-container"
    @mouseover="hover"
    @mouseleave="leave"
    @mousemove="move"
    @mousedown="down"
    @mouseup="up"
  >
    <div
      v-show="active"
      ref="cursorX"
      style="
        position: absolute;
        top: 0;
        left: 0;
        background: #ffffff;
        width: 2px;
        height: 100%;
        pointer-events: none;
      "
    />
    <div
      v-show="active"
      ref="cursorY"
      style="
        position: absolute;
        top: 0;
        left: 0;
        background: #ffffff;
        height: 2px;
        width: 100%;
        pointer-events: none;
      "
    />
    <div
      ref="rect"
      style="
        border: 2px solid #ffffff;
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        display: none;
        pointer-events: none;
      "
    />
  </div>
</template>

<script>
export default {
  name: "MakeRect",
  props: ["onAdd"],
  data() {
    return {
      active: false,
      startPoint: null,
      endPoint: null,
    };
  },
  methods: {
    hover() {
      this.active = true;
    },
    leave(mouse) {
      this.active = false;
      this.release(false, mouse);
    },
    move(mouse) {
      let pos = this.calc(mouse);
      this.$refs.cursorX.style.left = pos.x + "px";
      this.$refs.cursorY.style.top = pos.y + "px";
      this.$refs.rect.style.right = pos.right + "px";
      this.$refs.rect.style.bottom = pos.bottom + "px";
    },
    down(mouse) {
      let pos = this.calc(mouse);
      this.$refs.rect.style.left = pos.x + "px";
      this.$refs.rect.style.top = pos.y + "px";
      this.$refs.rect.style.display = "block";
    },
    up(mouse) {
      this.release(true, mouse);
    },
    calc(mouse) {
      let container = this.$refs.container.getBoundingClientRect();
      return {
        x: mouse.x - container.x - 1,
        y: mouse.y - container.y - 1,
        right: container.width - (mouse.x - container.x) - 1,
        bottom: container.height - (mouse.y - container.y) - 1,
      };
    },
    release(add, mouse) {
      if (add && this.$props.onAdd) {
        let container = this.$refs.container.getBoundingClientRect();
        let rect = this.$refs.rect.getBoundingClientRect();
        let rectX = (rect.x - container.x + rect.width / 2) / container.width;
        let rectY = (rect.y - container.y + rect.height / 2) / container.height;
        let rectW = rect.width / container.width;
        let rectH = rect.height / container.height;
        this.$props.onAdd([rectX, rectY, rectW, rectH]);
      }
      this.$refs.rect.style.display = "none";
    },
  },
};
</script>

<style scoped>
.m-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: crosshair;
}
</style>
