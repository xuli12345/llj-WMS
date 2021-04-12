<template>
  <div>
    <HomeTable
      :fTableView="fTableView"
      :tableName="'t_InboundOrderQuery'"
      :isSaveSuccess="isSaveSuccess"
    ></HomeTable>
  </div>
</template>
<script>
import HomeTable from "@/views/LibraryManage/Stock/components/HomeTable";
export default {
  components: {
    HomeTable
  },
  data() {
    return {
      fTableView: "t_InboundOrderQuery",
      //是否新增成功
      isSaveSuccess: false
    };
  },
  methods: {
    //点击x关闭弹窗
    handleClose(done) {
      this.drawer = false;
    },
    //点击x关闭弹窗
    handleEditClose(done) {
      this.drawerValue = false;
    },
    //关闭修改弹窗
    closeEditBox(val) {
      if (val) {
        this.isSaveSuccess = true;
      }
      this.drawerValue = false;
    },

    //关闭新增弹窗
    closeBox(value) {
      if (value) {
        this.isSaveSuccess = true;
      }
      this.drawer = false;
    }
  },
  watch: {
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
  },
  computed: {
    mainTabs: {
      get() {
        return this.$store.state.common.mainTabs;
      }
    }
  }
};
</script>
<style lang="scss"></style>
