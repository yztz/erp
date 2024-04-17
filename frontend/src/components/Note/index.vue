<template>
  <div class="note-container">
    <span><svg-icon icon-class="tip" class-name="note-icon"/></span>
    <span class="note-body">{{ message }}</span>
  </div>
</template>

<script>
export default {
  name: "index",
  props: ['message']
}
</script>

<style scoped lang="scss">
.note-container {
  font-size: 0.94rem;
  .note-icon {

  }

  .note-body {
    margin-left: 5px;
    color: #545459;
    font-weight: bold;
  }
}
</style>
