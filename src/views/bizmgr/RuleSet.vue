/**
 * @Author:      qinbb
 * @DateTime:    2018-03-19 16:30:08
 * @Description: 规则设置组件
 */
<template>
	<div class="app-container no-padding" ref="aa">
		<el-tabs type="border-card" style="height:inherit" @tab-click="handleClick">
		  	<el-tab-pane v-if="permBtn.rules_sets" label="疲劳驾驶" ruleTypes="2">
		  		<fatigue-driving v-if="name == '2'" ruleTypes="2"></fatigue-driving>
		  	</el-tab-pane>
		  	<el-tab-pane v-if="permBtn.rules_sets" label="围栏设置" ruleTypes="3">
		  		<fatigue-driving v-if="name == '3'" ruleTypes="3"></fatigue-driving>
		  	</el-tab-pane>
		  	<el-tab-pane v-if="permBtn.rules_sets" label="超速" ruleTypes="4">
		  		<fatigue-driving v-if="name == '4'" ruleTypes="4"></fatigue-driving>
		  	</el-tab-pane>
		  	<el-tab-pane v-if="permBtn.rules_sets" label="怠速" ruleTypes="1">
		  		<fatigue-driving  v-if="name == '1'" ruleTypes="1"></fatigue-driving>
		  	</el-tab-pane>
		</el-tabs>
	</div>
</template>

<script>
	import "../../assets/css/index.scss";
	import FatigueDriving from './FatigueDriving';//疲劳驾驶
	import { utils } from 'src/utils';
	export default {
		components: {
		    'fatigue-driving': FatigueDriving
		},
		data() {
			return {
				//按钮的权限 规则设置权限一样（疲劳驾驶、超速、怠速、围栏设置） true 显示  false 隐藏
				permBtn:{
					rules_sets: false
				},
				name:'2'//默认加载第一个
			}
		},
		mounted() {
			let vm = this;
			vm.getPerm(vm);
			vm.initHeight();
		},
		methods: {
			//获取当前页面的权限
			getPerm(vm){
				vm.permBtn = utils.permsButton(vm);
			},
			//初始化高度
		    initHeight(){
		    	let height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;//浏览器高度
		    	this.$refs.aa.style.height = (height - 80) +"px";
		    },
		    //tab切换
		    handleClick(tab, event){
		    	this.name = tab.$attrs.ruleTypes;//加载该组件
		    }
		}
	}
</script>

