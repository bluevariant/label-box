<template>
  <q-item tag="a" v-on:click="clickLink">
    <q-item-section v-if="icon" avatar>
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption>
        {{ caption }}
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script>
export default {
  name: "EssentialLink",
  props: {
    title: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      default: "",
    },
    link: {
      type: String,
      default: "#",
    },
    icon: {
      type: String,
      default: "",
    },
  },
  methods: {
    clickLink: function (e) {
      e.preventDefault();
      if (!this.$props.link) return;
      if (this.$props.link.startsWith("http")) {
        window.open(this.$props.link, "_blank");
      } else {
        this.$router.push(this.$props.link);
      }
    },
  },
};
</script>
