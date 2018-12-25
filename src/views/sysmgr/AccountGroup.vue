/**
 * @Author:      qinbb
 * @DateTime:    2018-03-19 15:05:10
 * @Description: 用户用户组管理  父组件
 */
<template>
	<div class="app-container no-padding">
		<el-tabs type="border-card" @tab-click="handleClick">
		  <el-tab-pane v-if="permBtn.account_account"  label="用户管理" tabName="account">
		  	<account-manage v-if="names == 'account'"></account-manage>
		  </el-tab-pane>
		  <el-tab-pane v-if="permBtn.account_group"  label="用户组管理" tabName="group">
		  	<group-manage v-if="names == 'group'"></group-manage>
		  </el-tab-pane>
		</el-tabs>
	</div>
</template>

<script>
	import "../../assets/css/index.scss";
	import AccountManage from './AccountManage';//用户管理
	import GroupManage from './GroupManage';//用户组管理
	import { utils } from 'src/utils';
	export default {
		components: {
		    'account-manage': AccountManage,
		    'group-manage': GroupManage,
		},
		data() {
			return {
				//按钮的权限 查询query 新增add   true 显示  false 隐藏
				permBtn:{
					account_account:false,
					account_group:false
				},
				names: 'account'//默认加载第一个
			}
		},
		mounted() {
			let vm = this;
			vm.getPerm(vm);
		},
		methods: {
			//获取当前页面的权限
			getPerm(vm){
				vm.permBtn = utils.permsButton(vm);
			},
			//tab切换
		    handleClick(tab, event){
		    	this.names = tab.$attrs.tabName;//加载该组件
		    }
		}
	}
</script>
<style rel="stylesheet/scss" lang="scss">
	
</style>