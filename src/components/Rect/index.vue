<template>
  <div
    :style="{
      position: 'absolute',
      border: '2px solid #FFFFFF',
      cursor: 'pointer',
      ...displayBox,
    }"
    @hover="hover"
  >
    <div
      :style="{
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0, 0.25)',
        cursor: 'default',
      }"
      class="flex items-center justify-center"
    >
      {{ $props.data.label }}
      <div class="index text-primary q-pl-sm q-pr-sm">#{{ $props.index + 1 }}</div>
    </div>
  </div>
</template>

<script>
function data(self) {
  return {
    box: [],
  };
}

export default {
  name: "Rect1",
  props: ["data", "index"],
  data() {
    return data(this);
  },
  computed: {
    displayBox() {
      return {
        left: (this.box[0] - this.box[2] / 2) * 100 + "%",
        top: (this.box[1] - this.box[3] / 2) * 100 + "%",
        width: this.box[2] * 100 + "%",
        height: this.box[3] * 100 + "%",
      };
    },
  },
  mounted() {
    console.log(this.$props.data);
    this.box = this.$props.data.box;
  },
  methods: {
    hover() {
      console.log("hover");
    },
  },
};
</script>

<style scoped>
.index {
  position: absolute;
  top: 0;
  left: 0;
  background: rgba(255, 255, 255, 0.5);
  pointer-events: none;
}
</style>
