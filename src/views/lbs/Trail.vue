/** * @Author: dousp 
 * * @DateTime: 2018-04-02 
 * @Description: 轨迹回放组件
*/
<template>
	<div class="app-container trail-app-container">
		<!-- 搜索条件 -->
		<div class="filter-container">
			<el-form :inline="true" :model="listQuery" class="demo-form-inline">
				<el-form-item label="选择车辆">
					<el-input v-model="carNum" placeholder="请点击获取车辆" @click.native = "getCarId" readonly class="selectCarTree-input"></el-input>
					<i class="el-icon-error closeI" @click="clearCar"></i>
				</el-form-item>
				<el-form-item label="轨迹时间" class="allDate">
					<el-date-picker class="date" id="date4" v-model="queryData" type="date" placeholder="选择日期" :picker-options="endDateOpt" value-format="yyyy-MM-dd" clearable></el-date-picker>
					<el-time-picker class="time" id="[1,2]" is-range v-model="queryTime" range-separator="至" start-placeholder="开始时间" value-format="HH:mm:ss" end-placeholder="结束时间" placeholder="选择时间范围" clearable></el-time-picker>
					<el-checkbox style="margin-left:30px;" v-model="listQuery.isDenoising">是否去噪</el-checkbox>
				</el-form-item>
				<el-form-item>
					<el-button class="filter-item btnColor" type="primary" icon="el-icon-search" @click.native="getTrackList">查询</el-button>
					<el-button v-if="permBtn.trail_export" class="filter-item btnColor" type="primary" @click.native="exportHandle">导出轨迹</el-button>
				</el-form-item>
			</el-form>
		</div>
		<div class="mapdiv">
			<div id="allmapTrail" class="mapTrail" v-bind:style="{height: mapHeight}"></div>
			<div class="track-replay">
				<el-button :disabled="startDisabled" :class="startBtnVisibly == true ? 'track-start' : 'track-stop'" :title="startBtnVisibly == true ? '开始' : '暂停'" @click="lushuStartStop"></el-button>
				<span></span>
				<el-button class="track-back" title="快退" :disabled="currentSpeed == 1" @click="lushuReduceSpeed"></el-button>
				<el-slider class="speed-slider" :max="mapArrPois.length" :disabled="sliderValue > mapArrPois.length - 1 || sliderValue == 0" v-model="sliderValue" @change="valueChanged"></el-slider>
				<el-button class="track-go" title="快进" :disabled="currentSpeed == 8" @click="lushuAddSpeed"></el-button>
				<!-- <span></span> -->
				<el-radio-group v-model="currentSpeed">
					<el-radio-button title="一倍" label="1">X1</el-radio-button>
					<el-radio-button title="两倍" label="2">X2</el-radio-button>
					<el-radio-button title="四倍" label="4">X4</el-radio-button>
					<el-radio-button title="八倍" label="8">X8</el-radio-button>
				</el-radio-group>
			</div>
			<div class="opendis">
				<el-button @click="opendis">测距</el-button>
			</div>
			<div class="info-box">
				<ul>
					<li class="fl tabBtn">
						<el-button class='tab-active' @click.native.prevent="tabConShow">轨迹点</el-button>
					</li>
					<li class="fr">
						<!-- <el-button icon="el-icon-arrow-up" v-show="!infoVisible" title="展开" @click="tabConShow"></el-button> -->
						<el-button class="tabBtn" icon="el-icon-arrow-down" v-show="infoVisible" title="收回" @click="tabConHide"></el-button>
						<el-button class="tabBtn tabSmall" v-show="!infoVisible || (infoVisible && height == maxHeight)" title="最小展开" @click="tabConShow"></el-button>
						<el-button class="tabBtn tabBig" v-show="!infoVisible || (infoVisible && height != maxHeight)" title="最大展开" @click="tabConShowMax"></el-button>
						<!-- <el-button icon="el-icon-arrow-down" v-show="infoVisible" title="收回" @click="tabConHide"></el-button> -->
					</li>
				</ul>
				<div class="Gpstable" v-show="infoVisible == true">
					<!-- 表格 -->
					<el-table ref="multipleTable" style="width:100%;" :data="trackListPage" row-key="rowIndex" :current-row-key="currentPos" :height="height" highlight-current-row border fit v-loading="listLoading"
						element-loading-text="拼命加载中">
						<el-table-column prop="rowIndex" align="center" label='序号' width="80"></el-table-column>
						<el-table-column align="center" label="时间" prop="linkTime" width="150"></el-table-column>
						<el-table-column align="center" label='速度' width="100">
							<template slot-scope="scope">
								{{scope.row.speed + "km/h"}}
							</template>
						</el-table-column>
						<el-table-column align="center" label="里程（km）" width="100">
							<template slot-scope="scope">
								<span v-if="scope.row.mileage">{{scope.row.mileage}}</span>
								<span v-else>-</span>
							</template>
						</el-table-column>
						<el-table-column align="center" label="位置" prop="address" show-overflow-tooltip>
							<template slot-scope="scope">
								<span v-if="scope.row.address">{{scope.row.address}}</span>
								<el-button v-else class="addressBtn" @click="addressConvet(scope.$index, scope.row)" title="点击经纬度解析为参考地址">{{scope.row.longitude}},{{scope.row.latitude}}</el-button>
							</template>
						</el-table-column>
						<el-table-column align="center" label='状态'>
							<template slot-scope="scope">
								<div>
									{{"ACC"}}{{(scope.row.acc=='1')?"开":"关"}}
									{{"，网络信号"}}{{(scope.row.simSignal == '99') ? "无" : (scope.row.simSignal>='25') ? "好": (scope.row.simSignal >= '15')?"正常" : (scope.row.simSignal >= '10')?"较弱":"弱"}}
									<label v-if="scope.row.description">{{"，"}}{{scope.row.description}}</label>
								</div>
								<!-- ACC开启，SD卡正常，网络信号好，录像：CH1 -->
							</template>
						</el-table-column>
						<el-table-column align="center" label="报警" prop="alarm" show-overflow-tooltip>
							<template slot-scope="scope">
								<div v-html="convertAlarmType(scope.row.alarm)"></div>
							</template>
						</el-table-column>
					</el-table>
					<div class="pageDiv">
						<el-pagination
							:disabled="!startBtnVisibly"
							@size-change="handleSizeChange"
							@current-change="handleCurrentChange"
							:current-page.sync="currentPage"
							:page-sizes="[200, 500, 1000]"
							layout="total, sizes, prev, pager, next, jumper"
							:total="trackList.length">
						</el-pagination>
					</div>
				</div>
			</div>
		</div>

		<depart-tree :departData="departData" @closeDialog = "closeDepart($event)" @getCarIds="getCar($event)"></depart-tree>
	</div>
</template>

<script>
	import "../../assets/css/index.scss";
	import { Message } from 'element-ui';
	import { validate } from 'utils/validate';
	import { utils } from 'src/utils';
	import DateTimePicker from '../../components/DateTimePicker';//日期组件
	import DepartTree from '../../components/DepartTree'; //组织机构弹框
	
	const imgStart = require("assets/img/railStart.png");
	const imgStop = require("assets/img/railStop.png");

	export default {
		components: {
			'date-time-picker': DateTimePicker ,//日期组件
			'depart-tree': DepartTree,
		},
		data() {
			return {
				//按钮的权限
				permBtn:{
					trail_export: false
				},

				trackList: [], //轨迹表格list
				sectionList:[], //轨迹中间分段点
				trackListPage: [],
				currentPage: 1,
				pageSize: 200,

				height: 140, //table高度
				maxHeight: 500,
				mapHeight: 450,
				carList: [],

				//列表查询参数
				listQuery: {
					carId: "",
					endTime: "",
					startTime: "",
					isDenoising: true, //是否去噪
				},
				queryData: "",
				queryTime: "",

				endDateOpt: {
		        	disabledDate: (time) => {
		                return time.getTime() > new Date().getTime();
		            }
		        },

				geoc: null,

				//组织机构树
				departData: {
					dialog: false,//弹框是否显示
					currentKeys: [], //将当前选中的节点传进去
				},
				carNum: "",

				map: null,
				myDis: null,
				lushu: null, //路书
				currentSpeed: 1, // 当前速度倍数

				mapArrPois: [],
				finishArrPois: [],
				polyline:null,
				currentPos:0,
				sliderValue:0,
				lushuIsPause: false,
				startBtnVisibly: true,
				startDisabled: true,
				initSpend: 1000,

				infoVisible: false,//信息列表弹框

				//地址逆解析变量
				index:0,
				isFinish: true,
				reStart: false,

				convertTimer: null,
				listLoading: false,
			}
		},
		 watch: {
			currentSpeed(val) {
				if (this.lushu) {
					this.lushu._opts.speed = this.initSpend *  this.currentSpeed;
				}
			}
		},
		beforeDestroy(){
			if (this.convertTimer) {
				clearTimeout(this.convertTimer);
			}
		},
		mounted() {
			var vm = this;
			utils.getTableHeight((height)=>{
				let h = $('.sidebar-wrapper').height();  //左侧路由高度
				let h1 = $('.filter-container').height();  //搜索栏
				var height = (h - h1 - 73);
				vm.mapHeight = height + 'px';
				vm.maxHeight = height - 130;
				vm.initMap();
			});
			vm.getPerm();
			
			//加载报警
			utils.loadAlarmType(vm);
		},
		
		methods: {
			handleSizeChange(val) {
				this.pageSize = val;
				if (this.currentPage == 1) {
					this.trackListPage = this.trackList.slice((this.currentPage - 1) * this.pageSize, (this.currentPage - 1) * this.pageSize + this.pageSize);
				}
				else{
					this.currentPage = 1;
                }
			},
			handleCurrentChange(val) {
				this.trackListPage = this.trackList.slice((val - 1) * this.pageSize, (val - 1) * this.pageSize + this.pageSize);
			},
			//获取当前页面的权限
			getPerm(){
				this.permBtn = utils.permsButton(this);
			},
			initMap() {
				var vm = this;
				// 百度地图API功能
				vm.map = new BMap.Map("allmapTrail");    // 创建Map实例
				// vm.map.centerAndZoom("西安", 11);  // 初始化地图,设置中心点坐标和地图级别
				vm.map.centerAndZoom("北京", 5);  // 初始化地图,设置中心点坐标和地图级别
				vm.map.setCurrentCity("北京");          // 设置地图显示的城市 此项是必须设置的
				//添加地图类型控件
				vm.map.addControl(new BMap.MapTypeControl({
					mapTypes:[
							BMAP_NORMAL_MAP
						]}));   
				// vm.map.setCurrentCity("西安");          // 设置地图显示的城市 此项是必须设置的
				vm.map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放	

				vm.myDis = new BMapLib.DistanceTool(vm.map);

				// vm.myDis.addEventListener("addpoint", function(e) {
					// console.log("addpoint");
					// console.log(e.point);
					// console.log(e.pixel);
					// console.log(e.index);
					// console.log(e.distance);
				// });

				// vm.myDis.addEventListener("removepolyline", function(e) {
					// console.log("removepolyline");
					// console.log(e);
				// });
				
				vm.geoc = new BMap.Geocoder();//百度地图逆解析
			},
			//获取列表数据
			getTrackList() {
				var vm = this;
				vm.infoVisible = true;
				if (!this.getListParams()) {
					return;
				}
				
				if (!this.startBtnVisibly) {
					this.lushuStartStop();
					this.lushu.stop();
				}
				//调用接口
				vm.listLoading = true;
		        vm.$instance.get("/proxy/lbs/trail/findHistoryGps", {params : JSON.parse(JSON.stringify(vm.listQuery))}).then(res =>{
		          	if(res.status == 200){
						vm.trackList = res.data;
						vm.sectionList = [];
						vm.mapArrPois = [];
						var length = vm.trackList.length;
						vm.trackList.forEach((element, i) => {
							element.rowIndex = i + 1;
							//84转百度
							var bd09 = utils.wgs84tobd09(parseFloat(element.longitude), parseFloat(element.latitude));
							element.longitude = bd09[0];
							element.latitude = bd09[1]
							var mapPos = new BMap.Point(element.longitude, element.latitude);
							vm.mapArrPois.push(mapPos);
							// element.address = element.longitude+","+element.latitude;

							//轨迹数据按照上报间隔分段（上报时间大于5分钟，分段）
							if (i < length - 1) {
								var dateBegin = new Date(element.gpsTime.replace(/-/g, "/"));//replace方法将-转为/
								var dateEnd = new Date(vm.trackList[i+1].gpsTime.replace(/-/g, "/"));//replace方法将-转为/
								var dateDiff = dateEnd.getTime() - dateBegin.getTime();//时间差的毫秒数
								if (dateDiff >= 5 * 60 * 1000) {
									vm.sectionList.push({"begin": i, "end": i + 1});
								}
							}
							
						});
						vm.listLoading = false;
						if (vm.mapArrPois.length > 0) {
							vm.initLuShu();
						} else {
							Message.warning({message:"当前车辆该时间段没有轨迹信息！"});
						}
						if (vm.currentPage != 1) {
							vm.currentPage = 1;
						} else {
							vm.trackListPage = vm.trackList.slice(0, vm.pageSize);
						}

						vm.startDisabled = false;
						vm.startBtnVisibly = true;
						vm.sliderValue = 0;
						
		            }else{
		                Message.error({message:"调用接口失败"});
		            }
		        }).catch(error => {vm.listLoading = false;});
			},
			addressConvet(index, row) {
				var vm = this;
				var mapPos = new BMap.Point(this.trackListPage[index].longitude, this.trackListPage[index].latitude);
				utils.getAddress(vm.geoc, mapPos, (address)=> {
					 vm.trackListPage[index].address = address;
					 vm.trackListPage.splice(index, 0);
				});
			},
			//一条条转
			geocodeSearch() {
				var vm = this;
				utils.getAddress(vm.geoc, this.mapArrPois[this.index], (address)=> {
					 vm.trackList[vm.index].address = address;
					 vm.trackList.splice(0, 0);
					 if(vm.index < this.trackList.length - 1) {
						vm.index++;
					 	vm.geocodeSearch();
					 } else {
						 vm.isFinish = true;
					 }
				});
			},
			//10条十条转
			geocodeSearch1() {
				var vm = this;
				let finishCount = 0;
				let count = 10;
				if (this.index >= this.mapArrPois.length) {
					vm.isFinish = true;
					return;
				}
				count = (this.mapArrPois.length - this.index) >= 10 ? 10 : (this.mapArrPois.length - this.index);

				vm.convertTimer = window.setTimeout(function(){
					if (vm.reStart) {
						vm.reStart = false;
						vm.index = 0;
						vm.geocodeSearch1();
						return;
					}
					vm.$confirm("地址转换失败，是否继续转换？", '提示', {
						confirmButtonText: '继续',
						cancelButtonText: '取消',
						type: 'warning'
					}).then(() => {
						vm.geocodeSearch1();
					}).catch(() => {
						vm.isFinish = true;
						Message.info({message: '已取消经纬度解析为地址'});       
					});
				}, 10000);
				
				for (let i = 0; i < count; i++) {
					utils.getAddress(vm.geoc, this.mapArrPois[this.index + i], (address)=> {
						vm.trackList[vm.index + i].address = address;
						finishCount++;
						
						if (finishCount == count) {
							vm.convertTimer = window.clearTimeout(vm.convertTimer);
							if (vm.reStart) {
								vm.reStart = false;
								vm.index = 0;
								vm.geocodeSearch1();
							} else {
								vm.trackList.splice(0, 0);
								vm.index += count;
								if (!vm.isFinish) {
									vm.geocodeSearch1();
								}
							}
						}
					});
				}
			},
			//初始化路书
			initLuShu() {
				var vm = this;
				vm.map.clearOverlays(); 
				
				vm.map.addOverlay(new BMap.Polyline(vm.mapArrPois, {strokeColor: '#070'}));
				vm.map.setViewport(vm.mapArrPois);

				vm.finishArrPois = [];
				vm.finishArrPois.push(vm.mapArrPois[0]);
				vm.polyline = new BMap.Polyline(vm.finishArrPois, {strokeColor: '#700'});
				vm.map.addOverlay(vm.polyline);
					
				// vm.map.addOverlay(new BMap.Marker(vm.mapArrPois[0], {icon:new BMap.Icon(imgStart, new BMap.Size(20,20))}));
				// vm.map.addOverlay(new BMap.Marker(vm.mapArrPois[vm.mapArrPois.length - 1], {icon:new BMap.Icon(imgStop, new BMap.Size(20,20))}));
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
				
				//路书配置
				var luShuOptions = {
					defaultContent:"车辆实时信息",
					autoView: true,//是否开启自动视野调整，如果开启那么路书在运动过程中会根据视野自动调整
					icon: new BMap.Icon('http://lbsyun.baidu.com/jsdemo/img/car.png', new BMap.Size(52,26),{anchor : new BMap.Size(27, 13)}),
					speed: vm.initSpend * vm.currentSpeed,
					enableRotation:true,//是否设置marker随着道路的走向进行旋转
					landmarkPois: [],
					showInfoWindow:true
				};

				vm.lushu = new BMapLib.LuShu(vm.map, vm.mapArrPois ,luShuOptions, currentPos => {
					if (Math.abs(vm.sliderValue - currentPos) > 5)
					{
					} else {
						vm.sliderValue = currentPos;
					}
					vm.currentPos = currentPos;
					var currentData = vm.trackList[vm.currentPos - 1];

					let mileage = currentData.mileage ? currentData.mileage : "-"

					let infos = "<div style='font-size: 12px;'><div style='margin-bottom: 6px;'><span class='info-widows-top'>"+currentData.carNum+"</span>"
						+"<span class='simSignalIconClass " + utils.getSimSignalClass(currentData.simSignal) + "'></span>"
						+"<span class='satelliteIcon'></span><span style='vertical-align: middle;'>" + currentData.satelliteNum +"个</span></div>"
						+"<div style='padding: 4px 0px;'><strong>定位状态：</strong><span>"+ utils.lbsFlagToLbsStr(currentData.lbsFlag) +"</span></div>"
						+"<div style='padding: 4px 0px;'><strong>定位时间：</strong><span>"+ currentData.gpsTime +"</span></div>"
						+"<div style='padding: 4px 0px;'><strong>通讯时间：</strong><span>"+ currentData.linkTime +"</span></div>"
						+"<div style='padding: 4px 0px;'><strong>速度：</strong><span>"+ currentData.speed +"km/h（"+ utils.angleToDireation(vm.trackList[currentPos - 1].direation)+"）</span></div>"
						+"<div style='padding: 4px 0px;'><strong>里程：</strong><span>"+ mileage +"km</span></div>"
						+"<div style='padding: 4px 0px;'><strong>状态：</strong><span>" + utils.accFlagToStr(currentData.acc) +"</span></div>";
					vm.lushu._opts.defaultContent = infos;
					
					//判断是否结束
					vm.startBtnVisibly = vm.currentPos == vm.mapArrPois.length;

					vm.finishArrPois.push(vm.mapArrPois[vm.currentPos - 1]);
					vm.polyline.setPath(vm.finishArrPois);

					//table滚动到当前行
					if (vm.infoVisible) {
						if (Math.ceil((currentPos - 1) / vm.pageSize) != vm.currentPage) {
							vm.currentPage = Math.ceil((currentPos - 1) / vm.pageSize);
						}
						$(".el-table__body-wrapper").scrollTop(((currentPos - 1) % vm.pageSize) * 28);
					}
				});

				vm.sectionList.forEach(element =>{
					vm.map.addOverlay(new BMap.Polyline([vm.mapArrPois[element.begin], vm.mapArrPois[element.end]], {strokeColor: '#D00'}));
				});
			},
			lushuStartStop() {
				if (this.startBtnVisibly == true) {
					this.startBtnVisibly = false;
					if (!this.lushuPause) {
						this.finishArrPois = [];
						this.finishArrPois.push(this.mapArrPois[0]);
						this.polyline.setPath(this.finishArrPois);
						this.sliderValue = 0;
					}
					this.lushuPause  = false;
					this.lushu.start();
				} else {
					this.startBtnVisibly = true;
					this.lushuPause = true;
					this.lushu.pause();
				}
			},
			lushuAddSpeed() {
				this.currentSpeed *= 2;
			},
			lushuReduceSpeed() {
				this.currentSpeed /= 2;
			},
			//值改变时触发（使用鼠标拖曳时，只在松开鼠标后触发）
			valueChanged(value) {
				if (value > this.trackList.length - 1) {
					value = this.trackList.length - 1;
				}
				var vm = this;
				vm.sliderValue = value;
				vm.lushu.setPos(vm.sliderValue);

				vm.finishArrPois = vm.mapArrPois.slice(0, vm.sliderValue);
			},
			convertAlarmType(type) {
				return utils.convertAlarmType(type, this);
			},			
			getListParams() {
				var vm = this;

				if (vm.listQuery.carId == "") {
					Message.error({message:"请选择查询车辆！"});
					return false;
				}
				
				if (vm.queryData == "") {
					Message.error({message:"请选择查询日期！"});
					return false;
				}

				if (vm.queryTime != "") {
					vm.listQuery.startTime = vm.queryData + " "+ vm.queryTime[0];
					vm.listQuery.endTime = vm.queryData + " "+ vm.queryTime[1];
				}
				else {
					Message.error({message:"请选择查询时间段！"});
					return false;
				}
				
				return true;
			},
			tabConShowMax() {
				this.height = this.maxHeight;
				this.infoVisible = true;
			},
			//展开
		    tabConShow(){
				this.height = 140;
				this.infoVisible = true;
		    },
		    //收回
		    tabConHide(){
				this.infoVisible = false;
		    },
			//导出
			exportHandle() {
				if (!this.getListParams()) {
					return;
				}

				utils.exportLists(this.listQuery, "/proxy/lbs/trail/exportGps", true);
			},
			//打开组织机构弹框
			getCarId(){
				this.departData.dialog = true;
				this.departData.currentKeys = [];
				if (this.listQuery.carId) {
					this.departData.currentKeys.push(this.listQuery.carId);
				}
			},
			//子节点取消
			clearCar(param){
				this.listQuery.carId = "";//选中的车ID
				this.carNum = "";
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
			//测距
			opendis(){
				this.myDis.open();
			},
		}
	}
</script>
<style rel="stylesheet/scss" lang="scss">
	@import "src/assets/css/mixin.scss";
	.trail-app-container{
		padding-bottom: 5px;
	}
	.mapdiv {
		position: relative;
		width: 100%;
	}
	.mapTrail{
		width: 100%;
		height: 100%;
		border: 1px solid #e9e9e9;
		overflow:hidden;
	}
	.info-box{
		position: absolute;
		bottom: 0;
		// @include size(100%, 160px);
		width: 100%;
		background: #fff;
		.el-tabs__content{
			padding: 0;
		}
		li.fr{
			padding-right: 20px;
			button{
				padding: 5px;
				margin-top: 6px;
			}
		}
	}
	.tab-active{
		background: #566fc9 !important;
		color: #fff !important;
	}
	.tabBtn button{
		border-radius: 0;
		padding: 12px 45px;
		float: left;
		margin: 0;
		border-left: none;
		background: #f2f2f2;
	}
	.track-replay{
		position: absolute;
		right:150px; 
		top:10px; 
		@include borderRadius;
		@include border;
		background:#fff;
		button{
			@include size(30px, 30px);
			padding: 0;
			float: left;
			border: none;
			margin: 5px 2px;
		}
		.speed-slider{
			width: 210px;
			float: left;
			height: 30px;
			margin: 0 15px;
			.el-slider__runway{
				margin: 17px 0;
			}
		}
		.track-start{background: url(../../assets/img/track-play.png) no-repeat center center !important;}
		.track-back{background: url(../../assets/img/track-back.png) no-repeat center center !important;}
		.track-go{background: url(../../assets/img/track-go.png) no-repeat center center !important;}
		.track-stop{background: url(../../assets/img/track-stop.png) no-repeat center center !important;}
	}
	.track-replay>span{
		display: inline-block;
		float: left;
		width: 2px;
		height: 26px;
		background: #e9e9e9;
		margin-top: 2px;
	}
	/*tbody tr:nth-child(odd){
    	background: #ffffff;
	}*/
	.allDate{
		.date{
			vertical-align: middle;
			width: 150px;
			margin-right: 10px;
		}
		.time{
			vertical-align: middle;
			width: 250px;
			.el-range-input{
				width: 90px !important;
			}
		}
	}
	.info-widows-top {
		border-radius: 10px;
		background-color: #586FCC;
		color: #fff;
		padding: 3px 8px;
		vertical-align: middle;
	}
	.Gpstable{
		thead th{
			padding: 3px 0;
		}
		tbody td{
			padding: 2px 0;
			font-size: 13px;
		}
	}
	.addressBtn {
		width: 100%;
		border: none;
		padding: 0;
		background: transparent;
	}
	.addressBtn:hover {
		background: transparent;
	}
	.pageDiv {
		text-align: right;

		.el-input__inner, .el-input.is-disabled{
			height: 28px !important;
			padding: 0;
		}
	}
	.tabBtn{
		width: 26px;
		height: 26px;
		vertical-align: middle;
		margin-bottom: 5px;
	}
	.tabSmall{
		background: url(../../assets/img/tabSmall.png);
		border: none;
	}
	.tabBig{
		background: url(../../assets/img/tabBig.png);
		border: none;
	}
	.opendis{
		position: absolute;
		right: 70px;
		top: 10px;
		button{
			height: 40px;
		}
	}
</style>
