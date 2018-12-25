/**
 * @Author:      qiaozp
 * @DateTime:    2018-03-28 15:26:27
 * @Description: 里程月报表
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
					<date-month-picker ref="dateMonthPicker" @changStartDate="getStartDate" @changEndDate="getEndDate"></date-month-picker>
				</el-form-item>
				<el-form-item>
					<el-button class="filter-item" type="primary" icon="el-icon-search" @click="getList(true)">查询</el-button>
				</el-form-item>
				<el-form-item class="fr">
					<el-button class="filter-item" type="primary" @click="getLine(echartType, true)">可视化图形</el-button>
					<el-button v-if="permBtn.mileage_export" class="filter-item" type="primary" icon="el-icon-download" @click="exportFormLists">导出</el-button>
				</el-form-item>
			</el-form>
		</div>
		
		<!-- 表格 -->
		<el-table ref="multipleTable" :data="list" :height="height"  fit highlight-current-row v-loading="listLoading" element-loading-text="拼命加载中">
			<el-table-column align="center" label='车牌号' prop="carNum"></el-table-column>
			<el-table-column align="center" label="组织机构" prop="deptName"></el-table-column>
			<el-table-column align="center" label="行驶里程(Km)" prop="mileage"></el-table-column>
			<el-table-column align="center" label='开始时间' prop="startTime"></el-table-column>
			<el-table-column align="center" label="结束时间" prop="endTime"></el-table-column>
			<el-table-column align="center" label="开始里程(Km)" prop="startMileage"></el-table-column>
			<el-table-column align="center" label="结束里程(Km)" prop="endMileage"></el-table-column>
		</el-table>
		
		<!-- 分页 -->
		<!-- <pagination ref="page" :total="total" @reLoadData="paginationChange"></pagination> -->

		<!-- 折线图弹窗 -->
		<div v-show="checkTrailEchartVisible" class="box" id="echartBox2">
			<div class="el-icon-circle-close close" @click="closeEchart"></div>
			<div class="mileDayLine" id="mileMonthLine"></div>
			<div class="switch-btn">
				<el-switch
				  	v-model="echartSwitch"
				  	active-text="折线图"
				  	inactive-text="柱状图"
				  	inactive-color="#409EFF"
				  	@change=showEchart>
				</el-switch>
			</div>
		</div>
	</div>
</template>

<script>
	import "../../assets/css/index.scss";
	import { Message } from 'element-ui';
	import { utils } from 'src/utils';
	import DepartTree from '../../components/DepartTree'; //组织机构弹框
	import Pagination from '../../components/Pagination';
	import DateMonthPicker from '../../components/DateMonthPicker';//选择月组件
	import initEcharts  from 'src/utils/initEchart';
	
	export default {
		components: {
			'depart-tree': DepartTree,
			'pagination': Pagination,
			'date-month-picker': DateMonthPicker,
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
					mileage_export: false,
				},
				
				//组织机构树
				departData: {
					dialog: false,//弹框是否显示
					checkBox: true//多选
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
				currPage: 1,
				total: null,
				listLoading: false,
				height: 540,
				
				//列表查询参数
				listQuery: {
					//iDisplayLength: 10,
					//iDisplayStart: 0,
					fromTime: '',
					toTime: '',
					carId: '',
					reportCycle: 'M'
				},
				checkTrailEchartVisible: false,
				echartTop: '162px',
				echartDialogWidth: '400px',
				echartDialogHeight: '400px',
				
				echartSwitch: true,
	            echartType: 'line',//图表类型
	            mileMonthLine: null, //折线图
	            echartData: [],//echart数据
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
					document.getElementById("echartBox2").style.width = $('.el-table').width() + 2 + 'px';//折线图的高度
					document.getElementById("echartBox2").style.height = $('.el-table').height() + 'px';//折线图的高度
					document.getElementById("mileMonthLine").style.width = $('.el-table').width() - 40 + 'px';//折线图的高度
					$('#mileMonthLine div:first-child').width($('#mileMonthLine').width());
					if(this.mileMonthLine && this.checkTrailEchartVisible){
						this.mileMonthLine.resize();
					}
				}, 300)
				
			}
		},
		mounted() {
			const vm = this;
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
				if(this.departData.checkBox){
					if(this.listQuery.carId && this.listQuery.carId.indexOf(",") > -1){
						this.departData.currentKeys = this.listQuery.carId.split(",");
					}else{
						this.departData.currentKeys.push(this.listQuery.carId);
					}
				}else{
					if (this.listQuery.carId) {
						this.departData.currentKeys.push(this.listQuery.carId);
					}
				}
			},
			//关闭组织机构弹框
			closeDepart(param){
				this.departData.dialog = false;
			},
			//确定选择车辆
			getCar(nodes){
				if(nodes){
					if(this.departData.checkBox){
						let carIdArr = [];
						let carNumArr = [];
						//树多选
						$.each(nodes, function(idx, obj) {
							//只统计车辆
							if(obj.type == 1) {
								carIdArr.push(obj.carId);
								carNumArr.push(obj.name);
							}
						});
						this.listQuery.carId = carIdArr.join(",");//选中的车ID
						if(carNumArr.length > 1){
							this.carNum = carNumArr[0] + "...更多";//车牌号
						}else{
							this.carNum = carNumArr[0];//车牌号
						}
					}else{
						this.listQuery.carId = nodes.carId;//选中的车ID
						this.carNum = nodes.name;//车牌号
					}
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
			
			//选择时间start
			getStartDate(startDate){
				this.listQuery.fromTime = startDate;
			},
			getEndDate(endDate){
				this.listQuery.toTime = endDate;
			},
			//选择时间end

			//判断条件是否选中
			queryFlag(){
				const vm = this;
				let flag = true;
				if(vm.$refs.car.value == ''){
					this.$message({
			          	message: '请选择搜索车辆！',
			          	type: 'warning',
			          	duration: '1500'
			        });
					flag = false;
				}
				if(!vm.listQuery.fromTime || !vm.listQuery.toTime){
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
			getList(isBackHome = false, btnType) {
				if (btnType && this.checkTrailEchartVisible) {
					this.getLine(this.echartType);
					return;
				}
			
				var vm = this;
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
				
		        vm.$instance.post("/proxy/report/mileage/findMileageReport", param).then(res =>{
		        	vm.listLoading = false;
		          if(res.status == 200){
						if(res.data && res.data.length>0){
                            vm.list = res.data;
                            if(vm.checkTrailEchartVisible){
                                vm.getLine(vm.echartType);
                            }
                        }else{
	                        vm.list = [];
                            Message.warning({ message: "当前车辆该时间段没有数据" });
                            if (vm.mileMonthLine) {
                                vm.checkTrailEchartVisible = false;
                                vm.mileMonthLine.clear(); //清空echarts画布
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
				utils.exportLists(this.listQuery, "/proxy/report/mileage/exportMileage");
			},
			//获取折线图
			getLine(type){
				const vm = this;
				if(!vm.queryFlag()){
					return ;
				}
				vm.listLoading = true;
				vm.checkTrailEchartVisible = true;
				vm.echartType = type;
				let param=JSON.parse(JSON.stringify(vm.listQuery));
		        vm.$instance.post("/proxy/report/mileage/findMileageLine", param).then(res =>{
		        	vm.listLoading = false;
		          	if(res.status == 200){
			          	if(res.data){
	                        vm.echartData = JSON.parse(JSON.stringify(res.data));//储存元数据
	                        vm.echartData.timeArr = vm.echartData.timeArr.reverse();
	                    	let lineArr = [];
							$.each(vm.echartData.data, function(index, item) {
				                let obj = {};
								obj.carNum = item.carNum;
								obj.mileage = item.mileage.reverse();
								lineArr.push(obj);
				            });
	                    	vm.echartData.data = lineArr;
	                        
                        	vm.handelData(vm.echartType);
			          	}else{
							Message.warning({message:"当前车辆该时间段没有数据"});
							vm.checkTrailEchartVisible = false;
			          	}
		            }else{
						Message.error({message:"调用接口失败"});
						vm.checkTrailEchartVisible = false;
		            }
		        }).catch(error => { vm.listLoading = false; vm.checkTrailEchartVisible = false; });
			},
			
			//改变Switch状态
	        showEchart(){
	    		if (this.echartSwitch) {
	    			this.handelData('line');
	    		} else{
	    			this.handelData('bar');
	    		}
	    	},
			
			//处理折线图的 高度 宽度
			handelData(type){
				const vm = this;
				vm.echartType = type;
				document.getElementById("echartBox2").style.width = $('.el-table').eq(1).width() + 2 + 'px';//折线图的高度
				document.getElementById("echartBox2").style.height = $('.el-table').eq(1).height() + 'px';//折线图的高度
				$('#mileMonthLine').height( $('#echartBox2').height() );
				if(vm.mileMonthLine){
					vm.mileMonthLine.clear();//清空echarts画布
				}
				vm.$nextTick(function() {
	                if (
	                    vm.echartData &&
	                    vm.echartData.data &&
	                    vm.echartData.timeArr &&
	                    vm.echartData.data.length > 0 &&
	                    vm.echartData.timeArr.length > 0
	                ) {
	                    vm.drawLine(vm.echartData.data, vm.echartData.timeArr);
	                } else {
	                    vm.checkTrailEchartVisible = false;
	                    Message.warning({ message: "当前车辆该时间段没有数据！" });
	                }
	            });
			},
			
			//画折线图
			drawLine(seriesArr,xAxisArr){
				const vm = this;
	            initEcharts().then(echarts => {
					vm.mileMonthLine = echarts.init(document.getElementById('mileMonthLine'));
					let arr = [];//折线图数组
					let legendArr = [];//折线图数组
					let seriesType = 'line';
		            let xAxisBoundaryGap = false;
					if (vm.echartType == 'line') {
						seriesType = 'line';
						xAxisBoundaryGap = false;
					} else{
						seriesType = 'bar';
						xAxisBoundaryGap = true
					}
					$.each(seriesArr, function(idx, obj) {
						let lineObj = {};
						lineObj.name = obj.carNum;
						lineObj.type = seriesType;
						lineObj.smooth= true;
						lineObj.data = obj.mileage;
						arr.push(lineObj);
						legendArr.push(obj.carNum);
					});
					// 绘制折线图
			        vm.mileMonthLine.setOption({
			            tooltip: {
			              	trigger: 'axis',
			              	axisPointer: {
			                  	type: 'cross',
			                  	label: {
			                      	backgroundColor: '#6a7985'
			                  	}
			              	}
			            },
			            legend: {data:legendArr},
			            toolbox: {
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
			                  	boundaryGap : xAxisBoundaryGap,
			                  	data : xAxisArr
			              	}
			            ],
			            yAxis : [
			                {
			                	name : '里程/Km',
			                    type : 'value'
			                }
			            ],
			            series : arr,
	                	color: ['#5b9bd5','#ed7d31', '#a5a5a5', '#ffc000', '#00a95f','#483977',  '#255e91', '#9e480e','#636363', '#997300', '#a74e6e']
			        });
			    })
			},
			//关闭折线图  table刷新最新的数据
			closeEchart(){
				this.checkTrailEchartVisible = false 
				this.getList();
				this.echartType = 'line';
	            this.mileMonthLine.clear(); //清空echarts画布
	            this.echartSwitch = true;
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
	.mileDayLine, .mileDayLine>div:first-child, canvas{
		width: 100%;
	}
</style>
