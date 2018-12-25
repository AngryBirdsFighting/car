<template>
  <div class>
    <el-menu
      :default-active="activeMenu"
      class="el-menu"
      mode="horizontal"
      background-color="#03a678"
      text-color="#fff"
      active-text-color="#ffcc00"
    >
      <template v-if="permission_routers" v-for="item in permission_routers">
        <!-- <div  class="meun"> -->
        <!--一级菜单-->
        <router-link
          v-if="item.children && item.children.length < 1"
          :key="item.menuId"
          :to="item.frontRouting"
        >
          <el-menu-item :index="item.frontRouting">
            <span :class="item.menuIcon"  aria-hidden="true"></span>
            {{item.menuName}}
          </el-menu-item>
        </router-link>
        <!--二级菜单-->
        <el-submenu
          v-else-if="item.children && item.children.length > 0"
          :key="item.menuId"
          :index="item.frontRouting"
        >
          <template slot="title">
            <span :class="item.menuIcon" aria-hidden="true"></span>
            {{item.menuName}}
          </template>
          <router-link
            v-for="child in item.children"
            :key="child.menuId"
            class="menu-indent"
            :to="child.frontRouting"
          >
            <el-menu-item :index="child.frontRouting">{{child.menuName}}</el-menu-item>
          </router-link>
        </el-submenu>
        <!--一级菜单-->
        <router-link v-else :to="item.frontRouting" :key="item.menuId">
          <el-menu-item :index="item.frontRouting">
            <span :class="item.menuIcon" aria-hidden="true"></span>
            {{item.menuName}}
          </el-menu-item>
        </router-link>
        <!-- </div> -->
      </template>
    </el-menu>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
// import { constants } from 'http2';
export default {
  data() {
    return {
      activeMenu: "", //选中的菜单颜色改变
      defaultOpeneds: [], //打开的菜单 是el-submenu的index值
      url: ""
      // menuLoad: true,//菜单加载
    };
  },
  computed: {
    ...mapGetters(["permission_routers"])
  },
  components: {},
  mounted() {
    this.activeMenus();
    console.log(this.permission_routers)
  },
  watch: {
    $route(now, old) {
      //监控路由变换，控制返回按钮的显示
      this.activeMenus();
    }
  },
  methods: {
    menuLoads() {
      if (this.routes) {
        this.menuLoad = false;
      }
    },
    activeMenus() {
      // this.defaultOpeneds = [];//清空打开菜单index数组 每次只打开一个菜单
      let purl = window.location.href;
      purl = purl.substr(purl.indexOf("#") + 1); //hash
      this.activeMenu = purl;
      this.url = purl;
    }
  }
};
</script>

<style  rel="stylesheet/scss" lang="scss" scoped>
.wscn-icon {
		margin-right: 10px;
	}
	

	.el-submenu .el-menu-item {
		padding: 0 0 0 60px !important;
	}
	
	.el-menu span {
		display: inline-block;
		width: 21px;
		height: 21px;
		background-repeat: no-repeat;
		background-position: center center;
	}
	
	.menu1-iocn {
		background-image: url(../../assets/img/menu1-iocn.png);
	}
	
	.menu2-iocn {
		background-image: url(../../assets/img/menu2-iocn.png);
	}
	
	.menu3-iocn {
		background-image: url(../../assets/img/menu3-iocn.png);
	}
	
	.menu4-iocn {
		background-image: url(../../assets/img/menu4-iocn.png);
	}
	
	.menu5-iocn {
		background-image: url(../../assets/img/menu5-iocn.png);
	}
	
	.show_hide_menu {
		height: 100%;
		width: 10px;
		background-color: rgba(255,255,255,0);
		position: absolute;
		top: 0;
		right: 0;
		z-index: 10;
		div{
			position: relative;
			width: 10px;
			height: 60px;
			top: 47%;
			cursor: pointer;
		}
		.menu_show{
			background: url(../../assets/img/menu-hide.png) no-repeat center center;
		}
		.menu_hide{
			background: url(../../assets/img/menu-show.png) no-repeat center center;
		}
	}
</style>
