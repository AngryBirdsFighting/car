/**
 * @Author:      qinbb
 * @DateTime:    2018-03-19 15:28:18
 * @Description: 里程报表父组件
 */
<template>
	<div class="app-container no-padding">
		<el-tabs type="border-card">
		  <el-tab-pane v-if="permBtn.mileage_day"  label="里程日报表">
		  	<alarm-day-report></alarm-day-report>
		  </el-tab-pane>
		  <el-tab-pane v-if="permBtn.mileage_day"  label="里程月报表">
		  	<alarm-month-report></alarm-month-report>
		  </el-tab-pane>
		</el-tabs>
	</div>
</template>

<script>
	import "../../assets/css/index.scss";
	import MileageDayReport from './MileageDayReport';//里程日报表
	import MileageMonthReport from './MileageMonthReport';//里程月报表
	import { utils } from 'src/utils';
	export default {
		components: {
		    'alarm-day-report': MileageDayReport,
		    'alarm-month-report': MileageMonthReport,
		},
		data() {
			return {
				//按钮的权限 查询query 新增add   true 显示  false 隐藏
				permBtn:{
					mileage_day:false
				},
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
			}
		}
	}
</script>
<style rel="stylesheet/scss" lang="scss">
	
</style>
