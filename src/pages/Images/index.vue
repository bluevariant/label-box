<template>
  <fragment>
    <q-breadcrumbs>
      <q-breadcrumbs-el icon="las la-home" to="/" />
      <q-breadcrumbs-el label="Projects" to="/projects" />
      <q-breadcrumbs-el v-bind:label="$route.query.name" />
    </q-breadcrumbs>
  </fragment>
</template>

<script>
function getDefaultData(self) {
  return {};
}

export default {
  name: "ImagesPage",
  data() {
    return getDefaultData(this);
  },
  mounted() {
    console.log(this.$route.query);
  },
};
</script>

<style scoped></style>
