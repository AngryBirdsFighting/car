/**
 * @Author:      qiaozp
 * @DateTime:    2018-03-19 15:25:42
 * @Description: 告警报表（日）
 */
<template>
	<div>
		<!-- 搜索条件 -->
		<div class="filter-container">
			<el-form :inline="true" :model="listQuery" class="demo-form-inline">
				<el-form-item label="选择车辆">
					<el-input ref="car" v-model="carNum" placeholder="请点击获取车辆" @click.native = "getCarId" readonly class="selectCarTree-input"></el-input>
					<i class="el-icon-error closeI" @click="clearCar"></i>
					<depart-tree :departData = "departData" @closeDialog = "closeDepart($event)" @getCarIds="getCar($event)" @clearCars="clearCar($event)"></depart-tree>
				</el-form-item>
				<el-form-item label="统计时间">
					<date-picker ref="datePicker" :isTodayBefore="true"></date-picker>
				</el-form-item>
				<el-form-item>
					<el-button class="filter-item" type="primary" icon="el-icon-search" @click="getList(true)">查询</el-button>
				</el-form-item>
				<el-form-item class="fr">
					<el-button class="filter-item" type="primary" @click="getList(false, 'bar')">柱状图</el-button>
					<el-button v-if="permBtn.alarm_export" class="filter-item" type="primary" icon="el-icon-download" @click="exportFormLists">导出</el-button>
				</el-form-item>
			</el-form>
		</div>
		
		<!-- 表格 -->
		<el-table ref="multipleTable" :data="list" :height="height"  fit highlight-current-row v-loading="listLoading" element-loading-text="拼命加载中">
			<el-table-column align="center" label='时间' prop="day"></el-table-column>
			<el-table-column align="center" label='车牌号' prop="carNum"></el-table-column>
			<el-table-column align="center" label="组织机构" prop="deptName"></el-table-column>
			<el-table-column align="center" label="紧急告警(次)" prop="urgent"></el-table-column>
			<el-table-column align="center" label="疲劳驾驶(次)" prop="fatigueDriving"></el-table-column>
			<el-table-column align="center" label='超速告警(次)' prop="speed"></el-table-column>
			<el-table-column align="center" label="亏电告警(次)" prop="powerLoss"></el-table-column>
			<el-table-column align="center" label="离线告警(次)" prop="offline"></el-table-column>
			<el-table-column align="center" label="怠速告警(次)" prop="idling"></el-table-column>
			<el-table-column align="center" label="碰撞告警(次)" prop="collisionWarning"></el-table-column>
			<el-table-column align="center" label="侧翻预警(次)" prop="rolloverWarning"></el-table-column>
			<el-table-column align="center" label="驶入告警(次)" prop="comeIn"></el-table-column>
			<el-table-column align="center" label="驶出告警(次)" prop="getOut"></el-table-column>
			<el-table-column align="center" label="超时停车(次)" prop="timeoutParking"></el-table-column>
		</el-table>
		
		<!-- 分页 -->
		<!-- <pagination ref="page" :total="total" @reLoadData="paginationChange"></pagination> -->

		<!-- 折线图弹窗 -->
		<div v-show="checkTrailEchartVisible" class="box" id="echartBox4">
			<div class="el-icon-circle-close close" @click="closeEchart"></div>
			<div class="mileDayLine" id="alarmDayLine"></div>
		</div>

	</div>
</template>

<script>
	import "../../assets/css/index.scss";
	import { Message } from 'element-ui';
	import { utils } from 'src/utils';
	import DepartTree from '../../components/DepartTree'; //组织机构弹框
	import DatePicker from '../../components/DatePicker';//日期组件
	import Pagination from '../../components/Pagination';
	import initEcharts  from 'src/utils/initEchart';


	const legendArr = ['碰撞告警','驶入告警','疲劳驾驶','驶出告警','怠速告警','离线告警','亏电告警','侧翻预警','超速告警','超时停车','紧急报警'];
	export default {
		components: {
			'depart-tree': DepartTree,
			'date-picker': DatePicker ,//日期组件
			'pagination': Pagination
		},
		watch: {
	      	filterText(val) {
				this.showTreeNodeId = [];
	        	this.$refs.tree2.filter(val);
	      	}
	   },
		data() {
			return {
				//按钮的权限 true 显示  false 隐藏
				permBtn:{
					alarm_export: false,
				},
				
				//组织机构树
				departData: {
					dialog: false,//弹框是否显示
				},
				carId:"",//选择的车辆ID
				carNum:"",//选择的车辆编号
				textData: "",
				imgsTypeVisible: false,
				filterText: '',
				treeData: [],
				//自定义树的属性
		        defaultProps: {
		            children: 'children',
		            label: 'deptName'
		        },
				
				list: null, //表格list
				total: 0,
				listLoading: false,
				height: 540,
				
				//列表查询参数
				listQuery: {
					//iDisplayLength: 10,
					//iDisplayStart: 0,
					fromTime: '',
					toTime: '',
					carId: '',
					reportCycle: 'D'
				},
				xAxisArr: [],//X轴
				seriesArr: [],//折线数组
				checkTrailEchartVisible: false,
				alarmDayLine: null//折线图
			}
		},
		computed: {
			isOpened(){
				return this.$store.getters.sidebar.opened;//判断左侧菜单是否为打开状态，返回true,false
			},
		},
		watch: {
			isOpened(newVal, oldVal) {
				window.setTimeout(() => {
					document.getElementById("echartBox4").style.width = $('.el-table').width() + 2 + 'px';//折线图的高度
					document.getElementById("echartBox4").style.height = $('.el-table').height() + 'px';//折线图的高度
					document.getElementById("alarmDayLine").style.width = $('.el-table').width() - 40 + 'px';//折线图的高度
					$('#alarmDayLine div:first-child').width($('#alarmDayLine').width());
					if(this.alarmDayLine && this.checkTrailEchartVisible){
						this.alarmDayLine.resize();
					}
				}, 300)
			}
		},
		mounted() {
			var vm = this;
			utils.getTableHeight((height) => {
		        this.height = height - 22;
		    });
			vm.getPerm();
		},
		methods: {
			//获取当前页面的权限
			getPerm(){
				this.permBtn = utils.permsButton(this);
			},
			
			//打开组织机构弹框
			getCarId(){
				this.departData.dialog = true;
				this.departData.currentKeys = [];
				if (this.listQuery.carId) {
					this.departData.currentKeys.push(this.listQuery.carId);
				}
			},
			//关闭组织机构弹框
			closeDepart(param){
				this.departData.dialog = false;
			},
			//确定选择车辆
			getCar(nodes){
				if(nodes.carId){
					this.listQuery.carId = nodes.carId;//选中的车ID
					this.carNum = nodes.name;//车牌号
					this.departData.dialog = false;
				}
			},
			//子节点取消
			clearCar(param){
				this.listQuery.carId = "";//选中的车ID
				this.carNum = "";
			},
			//获取组织机构树
		    initDepart(){
		        let params = {};
		        let vm = this;
		        vm.$instance.get(api.departData, {param: params}).then(res =>{
					vm.listLoading = false;
		          	if(res.status == 200){
		              	vm.treeData = res.data.data;
		              	resolve();//异步操作成功
		          	}else{
		              	Message.error(res.data.errorMsg);
		          	}
		        }).catch(error => { vm.listLoading = false; });
		    },
		    //判断条件是否选中
			queryFlag(){
				const vm = this;
				let flag = true;
				const dateTime = vm.$refs.datePicker.datePicker;//父组件获取子组件数据this.$refs.第一个datePicker是父组件ref值，第二个是子组件model值
				if(dateTime){
					vm.listQuery.fromTime = dateTime[0];
					vm.listQuery.toTime = dateTime[1];
				}
				if(vm.$refs.car.value == ''){
					this.$message({
			          	message: '请选择搜索车辆！',
			          	type: 'warning',
			          	duration: '1500'
			        });
					flag = false;
				}
				if(vm.listQuery.fromTime == '' || vm.listQuery.toTime == ''){
					this.$message({
			          	message: '请选择搜索时间！',
			          	type: 'warning',
			          	duration: '1500'
			        });
					flag = false;
				}
				return flag;
			},
			
			//获取列表数据
			getList(isBackHome = false,type) {
				var vm = this;
				vm.listQuery.fromTime = '';
				vm.listQuery.toTime = '';
				if(!vm.queryFlag()){
					return ;
				}
				/*if (isBackHome) {
					if (this.listQuery.iDisplayStart != 0) {
						this.$refs.page.backFirstPage();
						return;
					}
				}*/
				vm.listLoading = true;
				let param=JSON.parse(JSON.stringify(vm.listQuery));
		        vm.$instance.get("/proxy/report/alarm/findAlarmReport", {params:param}).then(res =>{
	        		vm.listLoading = false;
		          	if(res.status == 200){
			          	if(res.data && res.data.length > 0){
							vm.list = res.data;
							let newData = JSON.parse(JSON.stringify(res.data));//储存元数据
							let echartData = newData.reverse();//柱状图数据需要进行反转，因为元数据是按照时间倒序排列的
							if(type == "bar" || vm.checkTrailEchartVisible){
								vm.handelData(echartData);
							}
			          	}else{
			          		Message.warning({ message: "当前车辆该时间段没有数据" });
			          		vm.list = [];
			          		if (vm.alarmDayLine) {
			          			vm.checkTrailEchartVisible = false;
				                vm.alarmDayLine.clear(); //清空echarts画布
				            }
			          	}
						//vm.total = res.data.contTotal;
		            }else{
		                Message.error({message:"调用接口失败"});
		            }
		        }).catch(error => { vm.listLoading = false;});
			},
			/**
			 * 分页改变，加载数据
			 */
			// paginationChange(pageData) {
			// 	this.listQuery.iDisplayStart = pageData.iDisplayStart;
			// 	this.listQuery.iDisplayLength = pageData.iDisplayLength;
			// 	this.getList();
			// },
			
			//导出
			exportFormLists(){
				if(!this.queryFlag()){
					return ;
				}
				utils.exportLists(this.listQuery, "/proxy/report/alarm/exportAlarm");
			},
			//处理数据  X轴  Y轴
			handelData(data){
				const vm = this;
				vm.lineData = data; //总数据
				vm.xAxisArr = [];//X轴
				vm.seriesArr = [];//X轴
				let lineObj = {};
				lineObj.type = 'bar';
				lineObj.stack= "告警";
				lineObj.name = "碰撞告警";
				lineObj.data = [];
				let lineObj1 = {};
				lineObj1.type = 'bar';
				lineObj1.stack= "告警";
				lineObj1.name = "驶入告警";
				lineObj1.data = [];
				let lineObj2 = {};
				lineObj2.type = 'bar';
				lineObj2.stack= "告警";
				lineObj2.name = "疲劳驾驶";
				lineObj2.data = [];
				let lineObj3 = {};
				lineObj3.type = 'bar';
				lineObj3.stack= "告警";
				lineObj3.name = "驶出告警";
				lineObj3.data = [];
				let lineObj4 = {};
				lineObj4.type = 'bar';
				lineObj4.stack= "告警";
				lineObj4.name = "怠速告警";
				lineObj4.data = [];
				let lineObj5 = {};
				lineObj5.type = 'bar';
				lineObj5.stack= "告警";
				lineObj5.name = "离线告警";
				lineObj5.data = [];
				let lineObj6 = {};
				lineObj6.type = 'bar';
				lineObj6.stack= "告警";
				lineObj6.name = "亏电告警";
				lineObj6.data = [];
				let lineObj7 = {};
				lineObj7.type = 'bar';
				lineObj7.stack= "告警";
				lineObj7.name = "侧翻预警";
				lineObj7.data = [];
				let lineObj8 = {};
				lineObj8.type = 'bar';
				lineObj8.stack= "告警";
				lineObj8.name = "超速告警";
				lineObj8.data = [];
				let lineObj9 = {};
				lineObj9.type = 'bar';
				lineObj9.stack= "告警";
				lineObj9.name = "超时停车";
				lineObj9.data = [];
				let lineObj10 = {};
				lineObj10.type = 'bar';
				lineObj10.stack= "告警";
				lineObj10.name = "紧急报警";
				lineObj10.data = [];
				if(data && data.length > 0){
					$.each(data, function(idx, obj) {
						vm.xAxisArr.push(obj.day);
						//碰撞告警次数
						if(obj.collisionWarning >= 0){
							lineObj.data.push(obj.collisionWarning);//碰撞告警次数
						}
						if(obj.comeIn >= 0){
							lineObj1.data.push(obj.comeIn);//驶入告警次数		
						}
						if(obj.fatigueDriving >= 0){
							lineObj2.data.push(obj.fatigueDriving);//疲劳驾驶次数	
						}
						if(obj.getOut >= 0){
							lineObj3.data.push(obj.getOut);//驶出告警次数	
						}
						if(obj.idling >= 0){
							lineObj4.data.push(obj.idling);//怠速告警次数	
						}
						if(obj.offline >= 0){
							lineObj5.data.push(obj.offline);//离线告警次数	
						}
						if(obj.powerLoss >= 0){
							lineObj6.data.push(obj.powerLoss);//亏电告警次数	
						}
						if(obj.rolloverWarning >= 0){
							lineObj7.data.push(obj.rolloverWarning);//侧翻预警次数	
						}
						if(obj.speed >= 0){
							lineObj8.data.push(obj.speed);//超速告警次数	
						}
						if(obj.timeoutParking >= 0){
							lineObj9.data.push(obj.timeoutParking);//超时停车次数	
						}
						if(obj.urgent >= 0){
							lineObj10.data.push(obj.urgent);//紧急报警	
						}	
					});
					vm.seriesArr.push(lineObj);
					vm.seriesArr.push(lineObj1);
					vm.seriesArr.push(lineObj2);
					vm.seriesArr.push(lineObj3);
					vm.seriesArr.push(lineObj4);
					vm.seriesArr.push(lineObj5);	
					vm.seriesArr.push(lineObj6);
					vm.seriesArr.push(lineObj7);
					vm.seriesArr.push(lineObj8);
					vm.seriesArr.push(lineObj9);
					vm.seriesArr.push(lineObj10);
				}
				document.getElementById("echartBox4").style.width = $('.el-table').width() + 2 + 'px';//折线图的高度,45为弹框头部的高度
				document.getElementById("echartBox4").style.height = $('.el-table').height() + 'px';//折线图的高度,45为弹框头部的高度
				$('#alarmDayLine').height( $('#echartBox4').height() );
				vm.checkTrailEchartVisible = true;
				if(vm.alarmDayLine){
					vm.alarmDayLine.clear();//清空echarts画布
				}
				vm.$nextTick(function(){
					if(vm.xAxisArr.length > 0){
						vm.drawLine();
					}else{
						vm.checkTrailEchartVisible = false;
						Message.warning({message:"当前车辆该时间段没有数据！"});
					}
				});
			},
			
			//画叠加柱状图
			drawLine(){
				const vm = this;
				//异步加载
				 initEcharts().then(echarts => {
					vm.alarmDayLine = echarts.init(document.getElementById('alarmDayLine'));
					// 绘制柱状图
				        vm.alarmDayLine.setOption({
				            tooltip: {
				              	trigger: 'axis',
				              	axisPointer: {
				                  	type: 'cross',
				                  	label: {
				                      	backgroundColor: '#6a7985'
				                  	}
				              	},
				            },
				            align: {
						        options: {
						            left: 'left',
						            center: 'center',
						            right: 'right'
						        }
						    },
				            legend: {
				            	data: legendArr
				            },
				            toolbox: {
				            	x: "97%",
				                feature: {saveAsImage: {}}
				            },
				            grid: {
				                left: '3%',
				                right: '4%',
				                bottom: '3%',
				                containLabel: true
				            },
				            xAxis : [
				              	{
				              		name : '日期',
				                	type : 'category',
				                	boundaryGap : true,
				                	data : vm.xAxisArr
				              	}
				            ],
				            yAxis : [
				                {
				                	name : '告警/次',
				                    type : 'value'
				                }
				            ],
				            series : vm.seriesArr,
				            color: ['#5b9bd5','#ed7d31', '#a5a5a5', '#ffc000', '#00a95f','#483977',  '#255e91', '#9e480e','#636363', '#997300', '#a74e6e']
				        });

				 })
			},
	        //关闭折线图  table刷新最新的数据
	        closeEchart(){
	            this.checkTrailEchartVisible = false 
	            this.getList();
	        }
		}
	}
</script>
<style rel="stylesheet/scss" lang="scss">
	.echart-trail-dialog{
		.el-dialog__header {
			background: #fff;
			border-top: 1px solid #e9e9e9;
		}
		.el-dialog {
			margin-left: 236px;
		}
		.el-dialog__body{
			padding: 0 30px;
		}
		.el-dialog__headerbtn .el-dialog__close{
			color: red;
		}
	}
	.box{
		border: 1px solid #e9e9e9;
		background: #fff !important;
		position: absolute;
		top: 92px;
		padding: 10px 30px 0 10px;
		.close{
			position: absolute;
			width: 20px;
			height: 20px;
			right: 8px;
			top: 15px;
			color: red;
			font-size: 20px;
			cursor: pointer;
		}
	}
	.mileDayLine, .mileDayLine>div:first-child, canvas{
		width: 100%;
	}
</style>

