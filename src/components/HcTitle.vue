<template>
  <div>  
      <div class="title">
        <i class="border"  :style="{backgroundColor:sidebarLayoutSkin == 'dark' ? '#409EFF' : '#67C23A'}"></i>
        <span>{{content}}</span>
      </div>
      <div class="line"></div>
      
    </div>
</template>

<script>
export default {
  name: "HcTitle",
  props: ["content"],
  computed:{
    sidebarLayoutSkin: {
      get() {
        return this.$store.state.common.sidebarLayoutSkin;
      }
    }
  }
}
</script>

<style lang='scss' scoped>
.title {
  margin-bottom: 6px;
  display: flex;
  i.border {
    float: left;
    width: 4px;
    height: 16px;  
    margin-right: 10px;
  }
  
  span {
    line-height: 16px;
  }
}
.line {
  margin-bottom: 14px;
  margin-right: 30px;
}
</style>
