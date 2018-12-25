/**
 * @Author:      qinbb
 * @DateTime:    2018-02-01 11:07:45
 * @Description:  将左侧菜单组件放到html中  mapGetters创建路由映射
 */
 <template>
    <el-menu v-if="permission_routers.length != 0" mode="vertical" class="el-menu-vertical-demo" background-color="#fff" text-color="#7d7d7d" active-text-color="#7d7d7d"  >
        <sidebar-item :routes='permission_routers' :perms='permission_perms'></sidebar-item>
    </el-menu>
</template>

<script>
    import { mapGetters } from 'vuex';
    import SidebarItem from './SidebarItem';//左侧菜单
    export default {
      components: { SidebarItem },//左侧菜单组件
      computed: {
        // mapGetters工具函数 使用对象展开运算符（...）  会将store中的getter映射到局部计算属性中
        //如果你要将getter映射为不同的名称，请使用一个对象：{routers：permission_routers} 默认名称一样的是[]
        ...mapGetters([
          // 映射 this.permission_routers 为 store.getters.permission.routers
          'permission_routers','permission_perms'
        ])
      }
    }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
    .el-menu {
        min-height: 100%;
    }
</style>
