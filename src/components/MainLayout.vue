<template>
  <mu-flexbox orient="vertical" align="stretch" class="main-layout">
    <mu-appbar :title="name">
      <mu-icon-button icon="menu" @click="toggle(true)" slot="left"/>
      <mu-icon-button icon="more_vert" slot="right"/>
    </mu-appbar>
    <mu-drawer :open="open" :docked="docked" @close="toggle()">
        <mu-flexbox justify="center" >
            <mu-avatar :class="'drawer-header'" solt="center" :src="require('./../assets/logo.jpg')" :size="80"/>
        </mu-flexbox>
        <mu-menu @item-click="toggle()" color="green">
          <mu-menu-item title="当前停车" to="/park" leftIcon="local_parking"/>
          <mu-menu-item title="停车记录" to="/history" leftIcon="list"/>
          <mu-divider/>
          <mu-menu-item title="设置" leftIcon="settings"/>
          <mu-menu-item title="关于" leftIcon="info"/>
        </mu-menu>
    </mu-drawer>
    <router-view></router-view>
  </mu-flexbox>
</template>

<script>
  export default {
    data() {
      return {
        open: false,
        docked: true,
        name: '停车'
      }
    },
    created:function () {
      this.$router.push('/park')

    },
    methods: {
      toggle(flag) {
        this.open = !this.open
        this.docked = !flag
      }
    }
  }
</script>
<style>
  .drawer-header{
    margin: 30px;
  }
  .main-layout{
    height: 100%;
  }
</style>
