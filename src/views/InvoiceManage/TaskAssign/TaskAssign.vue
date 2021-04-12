<template>
  <div>
    <HomeTable
      :fTableView="fTableView"
      :tableName="'t_OutBoundorder_fenpai'"
      :isItem="true"
    ></HomeTable>
  </div>
</template>
<script>
import HomeTable from "./Components/HomeTable";

export default {
  components: {
    HomeTable
  },
  data() {
    return {
      fTableView: "t_OutBoundorder_fenpai"
    };
  },
   computed: {
    mainTabs: {
      get() {
        return this.$store.state.common.mainTabs;
      }
    }
  },
  watch:{
     mainTabs(e, o) {
      let name = this.$options._parentVnode.data.key.substring(1);
      let n = e.filter(ele => {
        return ele.name == name;
      });
      if (n.length == 0) {
        var key =
          this.$vnode.key == null
            ? this.$vnode.componentOptions.Ctor.cid +
              (this.$vnode.componentOptions.tag
                ? `::${this.$vnode.componentOptions.tag}`
                : "")
            : this.$vnode.key;
        var cache = this.$vnode.parent.componentInstance.cache;
        var keys = this.$vnode.parent.componentInstance.keys;
        if (cache[key]) {
          if (keys.length) {
            var index = keys.indexOf(key);
            if (index > -1) {
              keys.splice(index, 1);
            }
          }
          delete cache[key];
        }
      }
    }
  }
};
</script>
<style lang="scss" scoped></style>
