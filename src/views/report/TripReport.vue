/** * @Author: qiaozp
 * * @DateTime: 2018-03-28 
 * @Description: 行程报表统计组件
*/
<template>
	<div class="app-container">
		<!-- 搜索条件 -->
		<div class="filter-container">
			<el-form :inline="true" :model="listQuery" class="demo-form-inline">
				<el-form-item label="选择车辆">
					<el-input ref="car" v-model="carNum" placeholder="请点击获取车辆" @click.native = "getCarId" readonly class="selectCarTree-input"></el-input>
					<i class="el-icon-error closeI" @click="clearCar"></i>
					<depart-tree :departData = "departData" @closeDialog = "closeDepart($event)" @getCarIds="getCar($event)" @clearCars="clearCar($event)"></depart-tree>
				</el-form-item>
				<el-form-item label="行程时间">
					<el-date-picker 
						ref="inputDate"
						v-model="dataTime"
						type="date" 
						class="date"
						placeholder="选择日期"
						:picker-options="endDateOpt"
						value-format="yyyy-MM-dd">
					</el-date-picker>
				</el-form-item>
				<el-form-item>
					<el-button class="filter-item" type="primary" icon="el-icon-search" @click="getList(true)">查询</el-button>
				</el-form-item>
				<el-form-item class="fr">
					<el-button class="filter-item" type="primary" @click="getList('echart', echartType)">可视化图形</el-button>
					<el-button v-if="permBtn.trip_export" class="filter-item" type="primary" icon="el-icon-download" @click="exportFormLists">导出</el-button>
				</el-form-item>
			</el-form>
		</div>
		
		<!-- 表格 -->
		<el-table ref="multipleTable" :data="list" :height="height" fit highlight-current-row  v-loading="listLoading" element-loading-text="拼命加载中">
			<el-table-column align="center" label='车牌号' prop="carNum"></el-table-column>
			<el-table-column align="center" label="组织机构" prop="deptName"></el-table-column>
			<el-table-column align="center" label='行程开始时间' prop="startTime" width='180'></el-table-column>
			<el-table-column align="center" label="行程结束时间" prop="endTime" width='180'></el-table-column>
			<el-table-column align="center" label="开始经度" prop="startLng"></el-table-column>
			<el-table-column align="center" label="结束经度" prop="endLng"></el-table-column>
			<el-table-column align="center" label="开始纬度" prop="startLat"></el-table-column>
			<el-table-column align="center" label="结束纬度" prop="endLat"></el-table-column>
			<el-table-column align="center" label="总里程(Km)" prop="mileage"></el-table-column>
			<el-table-column align="center" label="总时间(s)" prop="timer"></el-table-column>
			<el-table-column align="center" label="平均速度(Km/h)" prop="avgSpeed"></el-table-column>
			<el-table-column align="center" label="操作">
				<template slot-scope="scope">
					<el-button @click.native.prevent="checkTrail(scope.$index, scope.row)" title="查看轨迹" class="btnColor" type="primary">轨迹查看</el-button>
				</template>
			</el-table-column>
		</el-table>
		
		<!-- 分页 -->
		<pagination ref="page" :total="total" @reLoadData="paginationChange"></pagination>

		<!-- 轨迹地图弹窗 -->
		<el-dialog class="map-trail-dialog" title="查看轨迹" :center="true" :modal="false" :visible.sync="checkTrailFormVisible" top="70px" :width="mapDialogWidth" lock-scroll>
			<div class="mapdiv">
				<div id="allmapTrail" class="mapTrail"></div>
			</div>
		</el-dialog>

		<!-- 折线图弹窗 -->
		<div v-show="checkTrailEchartVisible" class="box" id="echartBox1">
			<div class="el-icon-circle-close close" @click="closeEchart"></div>
			<div class="mileDayLine" id="tripLine"></div>
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
	import initEcharts  from 'src/utils/initEchart';

	const imgStart = require("assets/img/railStart.png");
	const imgStop = require("assets/img/railStop.png");
	
	

	export default {
		components: {
			'depart-tree': DepartTree,
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
				//按钮的权限   true 显示  false 隐藏
				permBtn:{
					trip_export: false,
				},
				
				//组织机构树
				departData: {
					dialog: false,//弹框是否显示
				},
				carId:"",//选择的车辆ID
				carNum:"",//选择的车辆编号
				filterText: '',
				treeData: [],
				//自定义树的属性
		        defaultProps: {
		            children: 'children',
		            label: 'deptName'
		        },
				
				selectDataList: null,//后台得到的原始数据
				list: null, //表格list
				total: null,//总条目数
				iDisplayLength: 10,//分页大小
				iDisplayStart: 0,//从哪条开始
				listLoading: false,
				height: 540,
				
				dataTime: new Date(),//选择日期
				//日期选择的限制   ---start---
		        endDateOpt: {
		        	disabledDate: (time) => {
		                return time.getTime() > new Date().getTime();
		            }
		        },
		    	//日期选择的限制  ---end---
				//列表查询参数
				listQuery: {
					fromTime: '',
					toTime: '',
					carId: '',
				},

				lineData: [],//折线图总数据
				xAxisArr: [],//X轴
				seriesArr: [],//折线数组
				map: null,
				checkTrailFormVisible: false,
				mapDialogHeight: 200,
				mapDialogWidth: '400px',
				echartTop: '162px',
				echartDialogWidth: '400px',
				echartDialogHeight: '400px',
				tripLine: null,//折线图
				
	            echartType: 'line',//图表类型
	            checkTrailEchartVisible: false,
	            tripLine: null, //折线图
	            echartSwitch: true,
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
					document.getElementById("echartBox1").style.width = $('.el-table').width() + 2 + 'px';//折线图的高度
					document.getElementById("echartBox1").style.height = $('.el-table').height() + 'px';//折线图的高度
					document.getElementById("tripLine").style.width = $('.el-table').width() - 40 + 'px';//折线图的高度
					$('#tripLine div:first-child').width($('#tripLine').width());
					if(this.tripLine && this.checkTrailEchartVisible){
						this.tripLine.resize();
					}
				}, 300);//延迟300毫秒绘画
			}
		},
		mounted() {
			const vm = this;
			utils.getTableHeight((height)=>{
				this.height = height;
				vm.mapDialogHeight = (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight) - 120;//浏览器高度
				vm.echartDialogHeight = vm.mapDialogHeight;
			});
			vm.getPerm();
		},
		methods: {
			//获取当前页面的权限
			getPerm(){
				this.permBtn = utils.permsButton(this);
			},
			
			//查看轨迹
			checkTrail(index, row) {
				if (this.$store.getters.sidebar.opened) {//true: 菜单打开; false: 菜单收回
					$('.map-trail-dialog .el-dialog').css('margin-left','221px');
				} else{
					$('.map-trail-dialog .el-dialog').css('margin-left','20px');
				}
				this.mapDialogWidth = ($('.app-container').width() + 30) + 'px'; //计算弹框的宽度
				this.checkTrailFormVisible = true;
				if (!this.map) {
					this.timeOutLoadMap(row);
				} else {
					this.map.clearOverlays();
					this.getTrackList(row);
				}
			},
			//延时触发加载地图
			timeOutLoadMap(row) {
				var vm = this;
				let t1 = window.setTimeout(()=>{
					window.clearTimeout(t1); //去掉定时器 
					vm.initMap();
					vm.getTrackList(row);
				}, 100);
			},

			initMap() {
				var vm = this;
				// 百度地图API功能
				vm.map = new BMap.Map("allmapTrail");    // 创建Map实例
				// vm.map.centerAndZoom("北京", 5);  // 初始化地图,设置中心点坐标和地图级别
				// vm.map.setCurrentCity("北京");          // 设置地图显示的城市 此项是必须设置的  
				vm.map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放	
				document.getElementById("allmapTrail").style.height = vm.mapDialogHeight + 'px';	
			},
			//获取列表数据
			getTrackList(row) {
				var vm = this;
				
				//调用接口
				let param = {carId: this.listQuery.carId, startTime: row.startTime, endTime: row.endTime, isDenoising: true};
		        vm.$instance.get("/proxy/lbs/trail/findHistoryGps", {params : param}).then(res =>{
					vm.listLoading = false;
		          	if(res.status == 200){
		                vm.trackList = res.data;
						vm.mapArrPois = [];
						
						vm.trackList.forEach((element, i) => {
							element.rowIndex = i + 1;
							//84转百度
							var bd09 = utils.wgs84tobd09(parseFloat(element.longitude), parseFloat(element.latitude));
							element.longitude = bd09[0];
							element.latitude = bd09[1]
							var mapPos = new BMap.Point(element.longitude, element.latitude);
							vm.mapArrPois.push(mapPos);
						});
						
						if (vm.mapArrPois.length > 0) {
							vm.infoVisible = true;
							vm.initLuShu();
						} else {
							Message.warning({message:"当前车辆该时间段没有轨迹信息！"});
						}						
		            }else{
		                Message.error({message:"调用接口失败"});
		            }
		        }).catch(error => { vm.listLoading = false;});
			},
			//初始化路书
			initLuShu() {
				var vm = this;
				vm.map.clearOverlays(); 
				
				vm.map.addOverlay(new BMap.Polyline(vm.mapArrPois, {strokeColor: '#070'}));
				vm.map.setViewport(vm.mapArrPois);

				var markerBegin = new BMap.Marker(vm.mapArrPois[0], {icon:new BMap.Icon(imgStart, new BMap.Size(20,20))});
				vm.map.addOverlay(markerBegin);

				markerBegin.addEventListener("mouseover", function() {
					markerBegin.setTop(true);
				});
				markerBegin.addEventListener("mouseout", function() {
					markerBegin.setTop(false);
				});

				var markerEnd = new BMap.Marker(vm.mapArrPois[vm.mapArrPois.length - 1], {icon:new BMap.Icon(imgStop, new BMap.Size(20,20))});
				vm.map.addOverlay(markerEnd);
				markerEnd.addEventListener("mouseover", function() {
					markerEnd.setTop(true);
				});
				markerEnd.addEventListener("mouseout", function() {
					markerEnd.setTop(false);
				});
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
		        }).catch(error => { vm.listLoading = false;});
		    },
			
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
				if(vm.$refs.inputDate.value == null){
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
			getList(ble, type) {
				const vm = this;
				if(!vm.queryFlag()){
					return ;
				}
				vm.listLoading = true;
				vm.listQuery.fromTime = utils.turnTime(this.$refs.inputDate.value) + ' 00:00:00';
				vm.listQuery.toTime =  utils.turnTime(this.$refs.inputDate.value) + ' 23:59:59';
	            if(ble == 'echart'){
	            	vm.echartType = type;
	            }
				let param = JSON.parse(JSON.stringify(vm.listQuery));
		        vm.$instance.post("/proxy/report/trip/findTripReport", param).then(res =>{
		        	vm.listLoading = false;
		          	if(res.status == 200){
			          	if(res.data && res.data.length > 0){
							let data = res.data;
			                vm.selectDataList = JSON.parse(JSON.stringify(data));//储存元数据
			                vm.getNewList(true);
							vm.total = res.data.length;
							//调取  处理数据  X轴  Y轴
							if(ble == 'echart' ||　vm.checkTrailEchartVisible){
								vm.handelData(res.data); 
							}
			          	}else{
			          		Message.warning({ message: "当前车辆该时间段没有数据" });
			          		vm.list = [];
							vm.total = 0;
							if(vm.tripLine){
								vm.checkTrailEchartVisible = false;
								vm.tripLine.clear();//清空echarts画布
							}
			            }
		            }else{
		                Message.error({message:"调用接口失败"});
		            }
		        }).catch(error => { vm.listLoading = false;});
			},
			
			//改变Switch状态
	        showEchart(){
	    		if (this.echartSwitch) {
	    			this.echartType = 'line';
	    		} else{
	    			this.echartType = 'bar';
	    		}
	    		this.handelData(this.selectDataList);
	    	},

			//处理数据  X轴  Y轴
			handelData(data){
				const vm = this;
				vm.lineData = data; //总数据
				vm.xAxisArr = [];//X轴
				vm.seriesArr = [];//Y轴
				if(data && data.length > 0){
					$.each(data, function(idx, obj) {
						let time = "";
						if(obj.endTime && obj.startTime){
							time = obj.startTime.substring(obj.startTime.length-8) + "-" + obj.endTime.substring(obj.endTime.length-8);
						}
						vm.xAxisArr.push(time);
						vm.seriesArr.push(obj.mileage);
					});
				}
				document.getElementById("echartBox1").style.width = $('.el-table').width() + 2 + 'px';//折线图的高度,45为弹框头部的高度
				document.getElementById("echartBox1").style.height = $('.el-table').height() + 'px';//折线图的高度,45为弹框头部的高度
				$('#tripLine').height( $('#echartBox1').height() );
				vm.checkTrailEchartVisible = true;
				if(vm.tripLine){
					vm.tripLine.clear();//清空echarts画布
				}
				vm.$nextTick(function(){
					if(vm.xAxisArr.length > 0  && vm.seriesArr.length > 0){
						vm.drawLine();
					}else{
						vm.checkTrailEchartVisible = false;
						Message.warning({message:"当前车辆该时间段没有数据！"});
					}
				});
			},
			
			//画折线图
			drawLine(){
			const vm = this;
	            initEcharts().then(echarts => {
					vm.tripLine = echarts.init(document.getElementById('tripLine'));
					// 绘制折线图
		            let xAxisBoundaryGap = false;
		            let seriesType = 'line';
					if (vm.echartType == 'line') {
						xAxisBoundaryGap = false;
						seriesType = 'line';
					} else{
						xAxisBoundaryGap = true;
						seriesType = 'bar';
					}
			        vm.tripLine.setOption({
			            title: { text: vm.carNum },
			            tooltip: {
			              trigger: 'axis',
			              axisPointer: {
			                  type: 'cross',
			                  label: {
			                      backgroundColor: '#6a7985'
			                  }
			              }
			            },
			            legend: {
			                data:['总里程']
			            },
			            toolbox: {
			                feature: {
			                    saveAsImage: {}
			                }
			            },
			            grid: {
			                left: '3%',
			                right: '4%',
			                bottom: '3%',
			                containLabel: true
			            },
			            xAxis : [
				            {
				              	name : '时间段',
				                type : 'category',
				                boundaryGap : xAxisBoundaryGap,
				                data : vm.xAxisArr
				            }
			            ],
			            yAxis : [
			                {
			                	name : '行程/Km',
			                    type : 'value'
			                }
			            ],
			            series : [
			                {
			                    name:'总里程',
			                    type:seriesType,
			                    smooth: true,
			                    data:vm.seriesArr
			                }
			            ]
			        });
			    })
			},
			
			//关闭图表  table刷新最新的数据
	        closeEchart(){
	            this.checkTrailEchartVisible = false;
	            this.getList('');
	            this.echartType = 'line';
	            this.tripLine.clear(); //清空echarts画布
	            this.echartSwitch = true;
	        },
			
			//对元数据进行处理
			getNewList(isBackHome = false) {
				if (isBackHome) {
					if (this.iDisplayStart != 0) {
						this.$refs.page.backFirstPage();
						return;
					}
				}
				var vm = this;
				vm.list = [];
				vm.list = vm.selectDataList.slice(vm.iDisplayStart, (vm.iDisplayStart + vm.iDisplayLength));
			},
			/**
			 * 分页改变，加载数据
			 */
			paginationChange(pageData) {
				this.iDisplayStart = pageData.iDisplayStart;
				this.iDisplayLength = pageData.iDisplayLength;
				this.getNewList();
			},
			
			//导出
			exportFormLists(){
				const vm = this;
				if(!vm.queryFlag()){
					return ;
				}
				this.listQuery.fromTime = utils.turnTime(vm.dataTime) + ' 00:00:00';
				this.listQuery.toTime =  utils.turnTime(vm.dataTime) + ' 23:59:59';
				utils.exportLists(this.listQuery, "/proxy/report/trip/exportTrip");
			},
		}
	}
</script>

<style rel="stylesheet/scss" lang="scss">
	.map-trail-dialog{
		.el-dialog__body{
			padding: 0px;
		}
		.el-dialog {
			margin-left: 221px;
		}
		.el-dialog__header {
			background: #7A90DE;
		}
	}
	.mapRail{
		width: 100%;
		height: 200px;
		border: 1px solid gray;
		overflow:hidden;
	}
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
		.switch-btn{
	    	position: absolute;
	    	right: 75px;
	    	top: 10px;
	    }
	}
	.mileDayLine, .mileDayLine>div:first-child, canvas{
		width: 100%;
	}
</style>

