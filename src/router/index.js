/**
 * @Author:      qinbb
 * @DateTime:    2018-02-01 09:12:07
 * @Description: 路由配置
 */
import Vue from 'vue';
import Router from 'vue-router';
import store from '../store/index.js';  //状态store
//webpack热加载在开发环境下会很慢，因此只在生产环境下进行懒加载
const _import = require('./_import_' + process.env.NODE_ENV);
/* 布局以及菜单*/
import Layout from '../views/layout/Layout';
/* login 登录找回密码 以及重置密码*/
const Login = _import('login/Index');
/* 个人信息 */
const Personal = _import('login/Personal');
/* 错误页面 */
const Err404 = _import('error/404');
const Err401 = _import('error/401');
/*位置服务：车辆定位组件*/
const CarGps = _import('lbs/CarGps');
/*位置服务：轨迹回放*/
const Trail = _import('lbs/Trail');
/*位置服务：告警管理*/
const AlarmManage = _import('lbs/AlarmManage');
/*监控服务：实时监控*/
const RealTimeMonitor = _import('monitor/RealTimeMonitor');
/*监控服务：视频回放*/
const VideoPlayBack = _import('monitor/VideoPlayBack');
/*系统管理：用户/组管理*/
const AccountGroup = _import('sysmgr/AccountGroup');
/*系统管理：角色管理*/
const RoleManage = _import('sysmgr/RoleManage');
/*系统管理：组织机构管理*/
const DepartManage = _import('sysmgr/DepartManage');
/*运营管理：车辆管理*/
const CarManage = _import('bizmgr/CarManage');
/*运营管理：驾驶员管理*/
const DriverManage = _import('bizmgr/DriverManage');
/*运营管理：设备管理*/
const EqumentManage = _import('bizmgr/EqumentManage');
/*运营管理：规则设置*/
const RuleSet = _import('bizmgr/RuleSet');
/*运营管理：围栏设置*/
const RailConfig = _import('bizmgr/RailConfig');
/*运营管理：定时拍照*/
const PhotoJob = _import('bizmgr/PhotoJob');
/*运营管理：监控设置*/
const MoitorSet = _import('bizmgr/MoitorSet');
/*统计报表：里程报表统计*/
const MileageReport = _import('report/MileageReport');
/*统计报表：行程明细报表*/
const TripReport = _import('report/TripReport');
/*统计报表：告警汇总报表*/
const AlarmReport = _import('report/AlarmReport');
/*统计报表：多媒体报表*/
const MultiMediasReport = _import('report/MultiMediasReport');

Vue.use(Router);//全局方法 Vue.use() 使用插件
  /**
    * hidden : true不显示在菜单栏
    * redirect : 设置重定向，noredirect是不重定向
    * noDropdown : true 不显示子菜单
    * meta : { role: ['admin'] }  will control the page role
    * children:嵌套路由,component必不可少，先进入父路由
    **/
    const constantRouterMap = [
      //登录、找回密码、重新设置密码、以及401、404
      { path: '/login', component: Login, hidden: true },
      { path: '/error/404', component: Err404, hidden: true },  //假地址时重定向
      { path: '/error/401', component: Err401, hidden: true }, 

      //路由 /  重定向到首页
      {
        path: '/',
        //redirect: '/lbs/CarGps',  //路由为 / 就重定向到默认首页
        redirect: to => {
          // 方法接收 目标路由 作为参数
          // return 重定向的 字符串路径/路径对
          let paths = "";
          console.log("store.getters.routerPath")
          console.log(store.getters.routerPath)
          
          if(store.getters.routerPath && store.getters.routerPath){
            paths =  store.getters.routerPath;
          }else{
            paths = '/user/Personal';
          }
          return paths;
        },
        hidden: true,
      },{
        path: '/lbs',
        component: Layout,
        redirect: 'noredirect',
        name: '位置服务',
        children: [
          { path: 'CarGps', component: CarGps, name: '车辆定位' },
          { path: 'Trail', component: Trail, name: '轨迹回放' },
          { path: 'AlarmManage', component: AlarmManage, name: '告警管理' }
        ]
      },{
        path: '/user',
        component: Layout,
        redirect: 'noredirect',
        name: '位置服务',
        children: [
          { path: 'Personal', component: Personal, name: '个人信息' }
        ]
      },{
        path: '/monitor',
        component: Layout,
        redirect: 'noredirect',
        name: '监控服务',
        children: [
          { path: 'RealTimeMonitor', component: RealTimeMonitor, name: '实时监控' },
          { path: 'VideoPlayBack', component: VideoPlayBack, name: '视频回放' }
        ]
      },{
        path: '/sysmgr',
        component: Layout,
        redirect: 'noredirect',
        name: '系统管理',
        children: [
          { path: 'AccountGroup', component: AccountGroup, name: '用户/组管理' },
          { path: 'RoleManage', component: RoleManage, name: '角色管理' },
          { path: 'DepartManage', component: DepartManage, name: '组织机构管理' }
        ]
      },{
        path: '/bizmgr',
        component: Layout,
        redirect: 'noredirect',
        name: '运营管理',
        children: [
          { path: 'CarManage', component: CarManage, name: '车辆管理' },
          { path: 'DriverManage', component: DriverManage, name: '驾驶员管理' },
          { path: 'EqumentManage', component: EqumentManage, name: '设备管理' },
          { path: 'MoitorSet', component: MoitorSet, name: '监控设置' },
          { path: 'RuleSet', component: RuleSet, name: '规则设置' }, 
          { path: 'RailConfig', component: RailConfig, name: '围栏设置' },
          { path: 'PhotoJob', component: PhotoJob, name: '定时拍照' }
        ]
      },{
        path: '/report',
        component: Layout,
        redirect: 'noredirect',
        name: '统计报表',
        children: [
          { path: 'MileageReport', component: MileageReport, name: '里程报表统计' },
          { path: 'TripReport', component: TripReport, name: '行程明细报表' },
          { path: 'AlarmReport', component: AlarmReport, name: '告警汇总报表' },
          { path: 'MultiMediasReport', component: MultiMediasReport, name: '多媒体报表' }
        ]
      },
      
      { path: '*', redirect: '/error/404', hidden: true }
    ];



//创建router 对路由constantRouterMap进行管理
export default new Router({
  mode: 'hash',  //开启history模式保证spa可以和以前的网页一样可以前进和后退  hash
  scrollBehavior: () => ({ y: 0 }),  //路由跳转保持原先的滚动位置，支持 history.pushState 的浏览器中可用。
  routes: constantRouterMap  //嵌套路由组
});





