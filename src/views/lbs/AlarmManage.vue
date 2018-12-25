/**
 * @Author:      qinbb
 * @DateTime:    2018-03-27 15:51:53
 * @Description: 告警管理组件
 */
<template>
	<div class="app-container">
		<!-- 搜索条件 -->
		<div class="filter-container">
			<el-form :inline="true" :model="listQuery" class="demo-form-inline">
				<el-form-item label="违规车辆">
					<el-input v-model="listQuery.carNum" placeholder="请输入车牌号" clearable></el-input>
				</el-form-item>
				<el-form-item label="部门">
					<depart_select @deptIdChange="deptCurrentChange"></depart_select>
				</el-form-item>
				<el-form-item label="告警类型">
					<el-select v-model="listQuery.alarmType" clearable placeholder="请选择告警类型">
						<el-option 
						v-for="item in alarmList"
						:key="item.dictCode"
						:label="item.dictName"
						:value="item.dictCode">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="状态">
					<el-select v-model="listQuery.isread" clearable placeholder="请选择状态">
						<el-option label="已读" value="1"></el-option>
						<el-option label="未读" value="0"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="日期">
					<date-picker ref="datePicker" :isTodayBefore="true" :isToday="isToday" clearable></date-picker>
				</el-form-item>
				<el-form-item>
					<el-button class="filter-item btnColor" type="primary" icon="el-icon-search" @click.native.prevent="initTable(true)">查询</el-button>
					<el-button v-if="permBtn.alarm_manage_read" class="filter-item btnColor" type="primary"  @click.native.prevent="handleReade">全部标记已读</el-button>
					<el-button v-if="permBtn.alarm_manage_export" class="filter-item btnColor" type="primary" icon="el-icon-download" @click.native.prevent="exportTable">导出</el-button>
				</el-form-item>
			</el-form>
		</div>
		<!-- 表格 -->
		<el-table ref="multipleTable" :data="list" :height="height"  fit highlight-current-row empty-text=" "  v-loading="listLoading"
						element-loading-text="拼命加载中">
			<el-table-column align="center" label='车辆' prop="carNum"></el-table-column>
			<el-table-column align="center" label="部门" prop="deptName"></el-table-column>
			<el-table-column align="center" label="告警类型" prop="alarmType">
				<template slot-scope="scope">
					<div v-html="convertAlarmType(scope.row.alarmType)"></div>
				</template>
			</el-table-column>
			<el-table-column align="center" label="驾驶员" prop="driverName"></el-table-column>	
			<el-table-column align="center" label="开始时间" prop="startTime"></el-table-column>
			<el-table-column align="center" label="结束时间" prop="endTime"></el-table-column>
			<el-table-column align="center" label="开始位置" prop="address" show-overflow-tooltip></el-table-column>
			<el-table-column align="center" label="结束位置" prop="endAddress" show-overflow-tooltip></el-table-column>
			<el-table-column align="center" label="告警描述" prop="description" show-overflow-tooltip></el-table-column>
			<el-table-column align="center" label="处理状态">
				<template slot-scope="scope">
					<div v-if="scope.row.isread == '1'">已读</div>
					<div v-else-if="scope.row.isread == '0'">未读</div>
					<div v-else>未知状态</div>
				</template>
			</el-table-column>
			<el-table-column align="center" label="操作">
				<template slot-scope="scope">
					<el-button 
					v-if="permBtn.alarm_manage_site" 
					@click.native.prevent="checkInfo(scope.$index, scope.row)" 
					title="查看位置"
					class="btnColor"
					type="primary">位置查看</el-button>
				</template>
			</el-table-column>
		</el-table>
		<!-- 分页 -->
		<pagination ref="page" :total="total" @reLoadData="paginationChange"></pagination>
		<!-- 查看位置组件 -->
		<seate ref="child" :seateVisible="seateVisible"  @changeSeate="changeSeates($event)"></seate>
	</div>
</template>

<script>
	import "../../assets/css/index.scss";
	import {api} from 'src/global/api';
	import { utils } from 'src/utils';
	import { validate } from 'utils/validate';
	import { Message } from 'element-ui';
	import DatePicker from '../../components/DatePicker';//日期组件
	import Seate from '../../components/Seate';//查看位置组件
	import DepartSelect from '../../components/DepartSelect';
	import Pagination from '../../components/Pagination';

	export default {
		components: { 
			'date-picker':DatePicker,//日期组件
			'seate':Seate,//查看位置组件
			'depart_select':DepartSelect,
			'pagination': Pagination
		 },
		data() {
	     	return {
	     		permBtn:{
					alarm_manage_read:false,//全部标为已读
					alarm_manage_export:false,//导出
					alarm_manage_site:false,//位置查看
	     		},
	     		//查看位置数据
	     		seateVisible:{
					alarmId: '',//告警Id
					dialog: false,//弹框是否显示
					tables: true//列表
	     		},
	     		listQuery:{
	     			iDisplayLength: 10,
					iDisplayStart: 0,
					carNum: '',//车牌号
					deptId: '',//组织机构ID
					isread: '',//是否已读 	1已读 0未读
					alarmType: '',//报警类型
					startTime: '',//开始时间
					endTime: ''//结束时间
	     		},

				listLoading: false,//table加载中
				height: 570,//table高度
				list: [],//table列表
				total: null,//总条数
				alarmList: [],//报警类型
				isToday: false,//是否回显当前日期
	      	};
	    },
	    mounted() {
			//加载报警数据
			utils.loadAlarmType(this);
	    	//table的高度
	    	utils.getTableHeight((height)=>{
				this.height = height;
			});
	    	this.initAlarmType();//获取报警类型
	    	//若是从首页跳转过来的
	    	if (this.$route.query.flag) {
			    this.listQuery.isread = null;//后台要求  redis和数据库表结构不一致
			    this.isToday = true;
			}
			this.getPerm();//按钮权限
			this.initTable();//初始化table
	    },
	    //计算属性
		computed:{

		},
		watch: {

		},
		methods: {
			//获取当前页面的权限
			getPerm(){
				this.permBtn = utils.permsButton(this);
			},
			//获取报警类型
			initAlarmType(){
				const vm = this;
				utils.dictsByCode("alarm_type", data => {
					vm.alarmList = data;
					vm.alarmList.sort(vm.sortArr);
				});
			},
			//排序
			sortArr(a,b){
				var codeA = a.dictCode.substr(3,a.dictCode.length),
					codeB = b.dictCode.substr(3,b.dictCode.length)
				return codeA - codeB;
			},
			//初始化table
			initTable(isBackHome = false){
				var vm = this;
				if (isBackHome) {
					if (this.listQuery.iDisplayStart != 0) {
						this.$refs.page.backFirstPage();
						return;
					}
				}
				vm.listLoading = true;
				vm.listQuery.startTime = "";
				vm.listQuery.endTime = "";
				const dateTime = vm.$refs.datePicker.datePicker;//父组件获取子组件数据this.$refs.第一个datePicker是父组件ref值，第二个是子组件model值
				if(dateTime){
					vm.listQuery.startTime = dateTime[0] + " 00:00:00";
					vm.listQuery.endTime = dateTime[1] + " 23:59:59";
				}
				let params = JSON.parse(JSON.stringify(vm.listQuery));
				vm.$instance.post('/proxy/lbs/alarm/findAlarmList', params).then(res =>{
		          	if(res.status == 200){
			          	vm.total = res.data.contTotal;
		              	vm.list = res.data.data;
		              	resolve();//异步操作成功
		          	}else{
		              	Message.error(res.data.errorMsg);
		          	}
		          	vm.listLoading = false;
		        }).catch(error => {vm.listLoading = false;});
			},

			//组织机构下拉选择回显
			deptCurrentChange(deptId) {
				this.listQuery.deptId = deptId;
			},
			convertAlarmType(type) {
				return utils.convertAlarmType(type, this);
			},
			//导出
			exportTable(){
				utils.exportLists(this.listQuery, "/proxy/lbs/alarm/exportAlarm");
			},
			//全部标为已读
			handleReade(){
				let params = {};
				params.alarmIds = [];
				let vm = this;
				for(let value in vm.list){
					if(vm.list[value].isread == 0){
						params.alarmIds.push(vm.list[value].alarmId);
					}
				}
				if(params.alarmIds.length == 0){
					Message.success({message: '本页已全部标为已读！'});
					return ; 
				}
				vm.handleAlarm(params, true);
			},
			//标为已读调后台接口
			handleAlarm(params, isToolTip){
				let vm = this;
				//处理告警
				vm.$instance.post("/proxy/lbs/alarm/handleAlarm", params).then(res =>{
					if(res.status == 200){
						if (res.data.success) {
							if (isToolTip) {
								Message.success({message: '告警信息标为已读！'});
							}
							
							vm.initTable();
						} else {
							Message.error({message:res.data.errorMsg});
						}						
					}else{
						Message.error({message:"调用接口失败"});
					}
				}).catch(error => {});	

			},
			//查看具体位置
			checkInfo(data,row){
				this.seateVisible.alarmId = row.alarmId;//告警ID
				if(row.isread == 0){
					let params = {};
					params.alarmIds = [];
					params.alarmIds.push(this.seateVisible.alarmId);
					this.handleAlarm(params, false);
				}
				if(this.seateVisible.alarmId){
					this.seateVisible.dialog = true;//显示查看信息弹框
					this.$refs.child.initAlarm(); // 告警信息
				}
			},
			/**
			 * 分页改变，加载数据
			 */
			paginationChange(pageData) {
				this.listQuery.iDisplayStart = pageData.iDisplayStart;
				this.listQuery.iDisplayLength = pageData.iDisplayLength;
				this.initTable();
			},
		    //关闭查看位置弹框
		    changeSeates(param){
		    	this.seateVisible.dialog = param;
		    }


		}
	}
</script>
<style rel="stylesheet/scss" lang="scss">
</style>
