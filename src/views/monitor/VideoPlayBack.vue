/** * @Author: qiaozp 
 * * @DateTime: 2018-02-27 
 * @Description: 视频回放组件
*/
<template>
	<div class="app-container no-padding video-back-con">
		<el-form :inline="true" :model="selectVideoData" class="demo-form-inline">
			<div class="fl select-box" v-bind:style="{height: heightData}">
				<p class="video-title">搜索</p>
				<div class="select-car">
					<el-form-item label="选择车辆：">
						<el-input v-model="carNum" placeholder="请点击获取车辆" @click.native="getCarId" readonly class="selectCarTree-input"></el-input>
						<i class="el-icon-error closeI" @click="clearCar"></i>
					</el-form-item>
				</div>
				<div>
					<p class="select-title">日期选择：</p>
					<el-date-picker 
						ref="inputDate"
						v-model="dataTime"
						type="date" 
						placeholder="选择日期"
						:picker-options="endDateOpt"
						id = "date1"
						value-format="yyyy-MM-dd">
					</el-date-picker>
					<p class="select-title">时间选择：</p>
					<el-time-picker 
						v-model="fromTime" 
						id = "date3"
						placeholder="开始时间" 
						value-format="HH:mm:ss">
					</el-time-picker>
					<el-time-picker 
						v-model="toTime" 
						id = "date2"
						placeholder="结束时间" 
						value-format="HH:mm:ss">
					</el-time-picker>
				</div>
				<div>
					<p class="select-title">文件位置：</p>
					<el-radio v-model="selectVideoData.localtion" label="1">终端设备</el-radio><br />
	  				<el-radio v-model="selectVideoData.localtion" label="2">存储服务器</el-radio>
				</div>
				<div>
					<p class="select-title">文件类型：</p>
					<el-radio v-model="selectVideoData.fileType" label="1">录像</el-radio><br />
				</div>
				<div>
					<p class="select-title">录像类型：</p>
					<el-radio v-model="selectVideoData.videoType" label="1">常规</el-radio><br />
					<el-radio v-model="selectVideoData.videoType" label="2">报警</el-radio><br />
					<el-radio v-model="selectVideoData.videoType" label="3">所有</el-radio><br />
				</div>
				<el-form-item class="selBtn">
					<el-button class="filter-item" type="primary" icon="el-icon-search" @click="getVideoData">查询</el-button>
				</el-form-item>
			</div>
		</el-form>
		<div class="fr videoShow-box" :style="{height: heightData}">
			<div class="back-video-box" :style="{height: videoData}">
				<p class="video-title">视频播放</p>
				<div ref="backVideo" id="backVideo" class="back-video" :style="{height: videoHeight}" @mouseenter="controlShowHide(true)"  @mouseleave="controlShowHide(false)">
					<div id="videoPlayer" :style="{height: videoHeight}"></div>
					<div class="video-control" :style="{height: controlHeight}">
						<!--滑块-->
						<el-slider 
							:disabled='!isPlay'
							v-model="slider" 
							:format-tooltip="formatTooltip"
							@change="sliderChange">
						</el-slider>
						<ul>
							<li class="fl">
								<span>{{videoCarName}}</span>
								<span>{{videoChannel}}</span>
								<span>{{videoTime}}</span>
							</li>
							<li class="fr">
								<el-button class="videoBtn fastBack" title="快退"
									@click="speedBoxShowHide(4)">
								</el-button>
								<!--<el-button 
									:class="isPlay ? 'videoBtn video-stop' : 'videoBtn video-play'"
									:title="isPlay ? '暂停' : '播放'" 
									@click="play">
								</el-button>-->
								<el-button 
									class="videoBtn video-stop"
									title="关闭视频" 
									@click="controlCloseVideo">
								</el-button>
								<el-button class="videoBtn fastForward" title="快进"
									@click="speedBoxShowHide(3)">
								</el-button>
								<el-button
									:class="isFullScreen ? 'videoBtn video-noscreen' : 'videoBtn video-screen'"
									:title="isFullScreen ? '退出全屏' : '全屏'"
									@click="fullScreen"> 
								</el-button>
							</li>
						</ul>
						<div v-if="speedBox" class="controlSpeed">
							<span @click="setPlaySpeed(1)" :class="selectSpeed == 1? 'speed-active' : ''">1X</span>
							<span @click="setPlaySpeed(2)" :class="selectSpeed == 2? 'speed-active' : ''">2X</span>
							<span @click="setPlaySpeed(3)" :class="selectSpeed == 3? 'speed-active' : ''">4X</span>
							<span @click="setPlaySpeed(4)" :class="selectSpeed == 4? 'speed-active' : ''">8X</span>
							<span @click="setPlaySpeed(5)" :class="selectSpeed == 5? 'speed-active' : ''">16X</span>
						</div>
					</div>
				</div>
			</div>
			<div class="table-box">
				<ul>
					<li class="fl">
						<el-button @click="tabShow(0)" :class="tabindex || 'tab-active' ">文件</el-button>
						<el-button @click="tabShow(1)" :class="tabindex && 'tab-active'">时间</el-button>
					</li>
					<li class="fr">
						<el-button v-if="permBtn.videoBack_task" icon="el-icon-download" title="查看下载任务" @click="downloadTaskShow"></el-button>
						<el-button icon="el-icon-arrow-up" v-show="showBtn" title="展开" @click="tabConShow"></el-button>
						<el-button icon="el-icon-arrow-down" v-show="hideBtn" title="收回" @click="tabConHide"></el-button>
					</li>
				</ul>
				<div v-if="timeVisible == true" style="width: 100%;height: 285px;">
					<div class="show-time">
						<div ref="demo" class="timeImgs-box" @mousemove="displayCoord($event)">
							<div class="channel" v-html="timeImgsData.channelOneData"></div>
							<div class="channel" v-html="timeImgsData.channelTwoData"></div>
							<div class="channel" v-html="timeImgsData.channelThreeData"></div>
							<div class="channel" v-html="timeImgsData.channelFourData"></div>
							<div id="to_top" class="to_top" v-bind:style="{left: showBoxLeft}">
								<div class="show-con" v-bind:style="{left: left,top: top}">
									<span class="channel-num">{{channelNum}}</span>
									<span class="now-time">{{nowTime}}</span>
								</div>
							</div>
						</div>
						<div class="time-box">
							<ul>
								<li><span>00:00</span></li>
								<li><span></span></li>
								<li><span>02:00</span></li>
								<li><span></span></li>
								<li><span>04:00</span></li>
								<li><span></span></li>
								<li><span>06:00</span></li>
								<li><span></span></li>
								<li><span>08:00</span></li>
								<li><span></span></li>
								<li><span>10:00</span></li>
								<li><span></span></li>
								<li><span>12:00</span></li>
								<li><span></span></li>
								<li><span>14:00</span></li>
								<li><span></span></li>
								<li><span>16:00</span></li>
								<li><span></span></li>
								<li><span>18:00</span></li>
								<li><span></span></li>
								<li><span>20:00</span></li>
								<li><span></span></li>
								<li><span>22:00</span></li>
								<li><span></span></li>
								<li><span>23:59</span></li>
							</ul>
						</div>
					</div>
				</div>
				<div v-if="fileVisible == true" style="width: 100%;height: 285px;">
					<!-- 表格 -->
					<el-table ref="multipleTable" :data="list" height="285" width="100%"  fit highlight-current-row v-loading="listLoading">
						<el-table-column align="center" label='序号' width="80px" type="index">{{index}}</el-table-column>
						<el-table-column align="center" label="录像类型" width="80px" prop="videoType">
							<template slot-scope="scope">
								<div v-if="scope.row.videoType == 1">
									常规
								</div>
								<div v-else>
									报警
								</div>
							</template>
						</el-table-column>
						<el-table-column align="center" label="通道" width="80px" prop="channel">
							<template slot-scope="scope">
								<span>CH{{scope.row.channel}}</span>
							</template>
						</el-table-column>
						<el-table-column align="center" label="文件位置" width="80px">
							<template slot-scope="scope">
								<div v-if="scope.row.location == '1'">
									终端设备
								</div>
								<div v-else>
									服务器
								</div>
							</template>
						</el-table-column>
						<el-table-column align="center" label="大小(MB)" width="100px" prop="fileSize"></el-table-column>
						<el-table-column align="center" label="开始时间" width="160px" prop="startTime"></el-table-column>
						<el-table-column align="center" label="结束时间" width="160px" >
							<template slot-scope="scope">
								<div v-if="scope.row.location == '1'">
									{{scope.row.endTime}}
								</div>
								<div v-else>
									-
								</div>
							</template>
						</el-table-column>
						<el-table-column align="center" label="文件" prop="fileUrl"></el-table-column>
						<el-table-column align="center" label="操作" width="100px">
							<template slot-scope="scope">
								<el-button 
									v-if="permBtn.videoBack_download" 
									class="btn download" 
									size="small" 
									title="下载" 
									@click="downloadVideo(scope.$index, scope.row)">
								</el-button>
								<el-button 
									v-if="scope.row.location == '1' && permBtn.videoBack_play" 
									:class="scope.row.status ? 'backVideo-stop' : 'backVideo-play'" 
									class="btn" 
									size="small" 
									:title="scope.row.status ? '关闭视频' : '播放'" 
									@click="closeOrPlayVideo(scope.$index, scope.row, $event)">
								</el-button>
							</template>
						</el-table-column>
					</el-table>
				</div>
			</div>
		</div>
		<span class="clear"></span>
		
		<!--下载列表弹框-->
		<el-dialog title="离线下载列表" :visible.sync="taskFormVisible" top="10%" width="900px" :close-on-click-modal="false"
			:close-on-press-escape="false" lock-scroll class=" taskLayerBox" @close="closeTaskDialog">
			<el-form class="small-space" ref="downloadTaskForm" :model="taskParamsTemp" label-position="left" label-width="100px">
				<el-form-item label="时间" class="allDate">
					<date-time-picker ref="datePicker" :isTodayBefore="true"></date-time-picker>
				</el-form-item>
				<el-form-item label="选择车辆：" class="fl">
					<el-input v-model="carDownNum" placeholder="请点击获取车辆" @click.native = "getDownCarId" readonly class="selectCarTree-input"></el-input>
					<i class="el-icon-error closeI" @click="clearDownCar"></i>
				</el-form-item>
				<el-form-item label="下载状态" class="fl" style="	width: 240px;">
					<el-select v-model="taskParamsTemp.status" clearable placeholder="请选择状态">
						<el-option label="未下载" value="0"></el-option>
						<el-option label="下载中" value="1"></el-option>
						<el-option label="下载失败" value="2"></el-option>
						<el-option label="已下载" value="3"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item class="fl" style="width: 80px;">
					<el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-search" @click="getList(true)">查询</el-button>
				</el-form-item>
			</el-form>
			
			<!-- 表格 -->
			<el-table ref="" :data="taskList" height="250" border fit highlight-current-row>
				<el-table-column align="center" label='序号' width="80px" type="index">{{index}}</el-table-column>
				<el-table-column align="center" label="车辆" prop="carNum"></el-table-column>
				<el-table-column align="center" label="下载状态" width="80px" prop="videoType">
					<template slot-scope="scope">
						<div v-if="scope.row.status == 0">
							未下载 
						</div>
						<div v-if="scope.row.status == 1">
							下载中
						</div>
						<div v-if="scope.row.status == 2">
							下载失败
						</div>
						<div v-if="scope.row.status == 3">
							已下载
						</div>
					</template>
				</el-table-column>
				<el-table-column align="center" label="文件开始时间" prop="startTime"></el-table-column>
				<el-table-column align="center" label="文件结束时间" prop="endTime"></el-table-column>
				<el-table-column align="center" label="任务开始时间" prop="taskStartTime"></el-table-column>
			</el-table>
				
			<!-- 分页 -->
			<pagination ref="page" :total="total" @reLoadData="paginationChange"></pagination>

		</el-dialog>
		
		<!--车辆树-->		
		<depart-tree :departData = "departData" @closeDialog = "closeDepart($event)" @getCarIds="getCar($event)" @clearCars="clearCar($event)"></depart-tree>		
			
	</div>
</template>
<script type="text/javascript">
	import "../../assets/css/index.scss";
	import { Message } from 'element-ui';
	import { utils } from 'src/utils';
	import DepartTree from '../../components/DepartTree'; //组织机构弹框
	import DateTimePicker from '../../components/DateTimePicker';//日期组件
	import Pagination from '../../components/Pagination';

	export default {
		components: {
			'depart-tree': DepartTree,
			'date-time-picker': DateTimePicker ,//日期组件
			'pagination': Pagination
		},
		data() {
			return {
				//按钮的权限   true 显示  false 隐藏
				permBtn:{
					videoBack_play: false, 
					videoBack_download: false, 
					videoBack_task: false 
				},
				isIe:false, // 判断是否是IE10全屏
				heightData: '500px',
				videoData: '500px',
				videoHeight: '500px',
				timeVisible: false,//Tab切换时间显示与隐藏
				fileVisible: false,//Tab切换文件显示与隐藏
				showBtn: true,//展开按钮
				hideBtn: false,//收回按钮
				taskFormVisible: false,//下载任务列表弹框
				videoChannel: '',
				videoCarName: '',

				//组织机构树
				departData: {
					dialog: false,//弹框是否显示
					currentKeys: []
				},              
				carNum:"",//选择的车辆编号
				
				carDownNum:"",//选择的车辆编号
		        
		        list: null, //表格list
		        listLoading: false,
		        total: 0,
		        
		    //用于搜索回放视频的时间
		        dataTime: new Date(),//选择日期
		        fromTime: "00:00:00",//开始时间
		        toTime:  "23:59:59",//结束时间
		        newDataTime: '',//转译后的日期
		    //日期选择的限制   ---start---
		        endDateOpt: {
		        	disabledDate: (time) => {
		                return time.getTime() > new Date().getTime();
		            }
		        },
		    //日期选择的限制  ---end---
		        tabindex: 0,//用于切换时间与文件的选中状态，添加class
		        index: '',
		        //搜索视频的参数
		        selectVideoData: {
		        	carId: '',//车辆ID
		        	fromTime: '',//开始时间
		        	toTime: '',//结束时间
		        	videoType: '3',//录像类型   1:常规 2:告警 3:所有
		        	localtion: '1',//存储位置  1:设备 2:服务器
		        	fileType: '1',//文件类型
		        },
		        //搜索任务列表参数
		        taskParamsTemp: {
		        	iDisplayLength: 10,
					iDisplayStart: 0,
					carId: '',
					fromTime: '',
					toTime: '',
					status: '',
		        },
		        taskList: null, //任务列表表格list
		        timeLength: 86400,
		        //时间图形的数据
		        timeData: {
		        	channel1: [],
		        	channel2: [],
		        	channel3: [],
		        	channel4: [],
		        },
		        timeImgsData: {
		        	channelOneData: '',
		        	channelTwoData: '',
		        	channelThreeData: '',
		        	channelFourData: '',
		        },
		        channelNum: '',
		        nowTime: '',
		        left: '',
		        top: '',
		        showBoxLeft: '',
		        playVideoData: {},//存放播放视频对象
				oldWidth: '',//视频的原始宽
				oldHeight: '',//视频的原始高
				isFullScreen: false,//是否全屏
				webSocket: null,
				videoServerUrl: '',//获取视频服务地址
				videoPlayUrl: '',//播放视频的流地址
			//播放视频的参数
				playParam: {
					carId : '',
					channel : '',
					codeStream : 1,
					dataType : 0,
					startTime : '',//开始时间
			        endTime : '',//结束时间
			        index : '',
				},
			//关闭视频的参数
				stopParam: {
					carId : '',
					channel : '',
					controlCmd : 1,
					speed : 0,
					time : 0,
				},
				videoCloseTime: '',//视频关闭的时间
				myHeart: '',//定时器(心跳)
				playTime: '',//视频播放时的时间
//				newDate: '',//心跳每次执行的时候重新获取时间
				msg1: "视频播放时长已到设置时间，如需继续观看，请设置视频自动关闭视频时间！",
				msg2: '视频已关闭',
				videoStyle: {
					width: '',
					height: '',
				},
				videoTime: null,//视频总时长
				slider: 0,//滑块
				speed: 0,//快进快退倍数
				direction: '',//判断是快进还是快退
				selectSpeed: 1,//当前选中的速度
				speedBox: false,//选中速度弹框隐藏
				controlSliderTip: '00:00:00',//控制条显示时间
				controlHeight: '6px',//控制条的默认高度
			}
		},
		
		computed: {
			isOpened(){
				return this.$store.getters.sidebar.opened;//判断左侧菜单是否为打开状态，返回true,false
			},
			isPlay(){
				if (this.list) {
					let obj = this.list.find((item) => {
						if(item.hasOwnProperty('status')){
							return item.status == true;
						}					
					});
					if (obj) {
						this.videoTimer();
						return true;
					} else{
						clearInterval(this.myHeart);//关闭定时器(心跳)
						return false;
					}
				} else{
					return false;
				}
			},
		},
		
		watch:{
			isOpened(newVal, oldVal){//根据左侧菜单是否为打开状态，重新渲染视频
				var len = document.getElementsByTagName('object').length;//判断是否有视频在播放
				if (len == 0) {
					return;
				} else { 
					var vm = this;
					let H = vm.$refs.backVideo.clientHeight;
					let W = vm.$refs.backVideo.clientWidth;
					if (newVal == true) {
						W = W - 170;
					} else {
						W = W + 164;
					}
					$("#backVideo").css({
						'width': W,
						'height': H
					});
					$("#videoPlayer").css({
						'width': W,
						'height': H
					})
				}
			}
		},
		
		mounted() {
			var vm = this;
			vm.getPerm(vm);
			utils.getTableHeight((height) => {
				let h = $('.sidebar-wrapper').height() - 20;  //左侧路由高度
				let videoHeight1 = $('.sidebar-wrapper').height() - 60;  //左侧路由高度
				let windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;//浏览器高度
				vm.heightData = h + 'px';
				vm.videoData = videoHeight1 + 'px';
				vm.videoHeight = (videoHeight1 - 42) + 'px';
			});
			window.onresize = function(){
				if(vm.isFullScreen){
					if(!vm.checkFull()){
						vm.exitFull();//要执行的函数
					}
				}
			};
			document.onkeyup = function (event) {//ie9  ie10 退出全屏
			    if(vm.isIe){
				    var e = event || window.event;
					var keyCode = e.keyCode || e.which;
					if(keyCode == 27){
						vm.exitFull();
					}
				}
			}
			vm.getVideoServer();//获取视频服务地址
			vm.getCloseVideoTime();//获取设置关闭视频时间
		},
		beforeDestroy(){
			//在退出页面时，关闭正在播放的视频
			if(this.playParam.carId != '' && this.isPlay == true){
				this.closeVideo(this.stopParam, '');
			};
			if(this.webSocket != null){
				this.webSocket.close();
			};
			if(this.myHeart){
				clearInterval(this.myHeart);
			}
		},
		methods: {
			//获取当前页面的权限
			getPerm(vm){
				vm.permBtn = utils.permsButton(vm);
			},
			
			//获取视频服务地址
			getVideoServer(){
				var vm = this;
				let param = {};
				vm.$instance.get("/proxy/config/findVideoServer", {params: param}).then(res =>{
		          if(res.status == 200){
		          		vm.videoServerUrl = res.data.ip + ":" + res.data.port;
		            }else{
		                Message.error({message:"调用接口失败"});
		            }
		        }).catch(error => {
		        });
			},
			
			//搜索
			getVideoData() {
				var vm = this;
				if(vm.selectVideoData.carId == ''){
					Message.warning({
						message:"请选择要查看的车辆",
						duration: 1500
					});
					return;
				}
				if(vm.dataTime == ''){
					Message.warning({
						message:"请选择要查看的日期",
						duration: 1500
					});
					return;
				}
				//在搜索时，如果当前有视频播放，需关闭当前播放的视频
				if(vm.stopParam.carId != ''){
					$('#videoPlayer').html('');
					vm.closeVideo(vm.stopParam, '');
				}
				vm.listLoading = true;

				if (vm.selectVideoData.localtion == "2") {
					vm.getServerFileList();
					return;
				}

				vm.tabindex = 0;
				let param = {};
				//webSocket参数
				let sendInfo = {
					account: vm.$store.getters.userInfo.account,//账号
					entId: vm.$store.getters.userInfo.entId,//企业ID
					carId: vm.selectVideoData.carId,//车辆ID
		        	fromTime: vm.setTime(vm.fromTime, "time"),//开始时间
		        	toTime: vm.setTime(vm.toTime, "time"),//结束时间
		        	videoType: vm.selectVideoData.videoType,//录像类型   1:常规 2:告警 3:所有
		        	localtion: vm.selectVideoData.localtion,//存储位置  1:设备 2:服务器
		        	fileType: vm.selectVideoData.fileType,//文件类型
				};
				let sendParam = JSON.stringify(sendInfo);
				vm.timeVisible = false;
				vm.fileVisible = true;
				vm.showBtn = false;
				vm.hideBtn = true;

				/*请求webSocketUrl*/
				vm.$instance.get("/proxy/config/findwebsocket", {params: param}).then(res =>{
		          if(res.status == 200){
						let webSocketUrl = res.data.ip + ":" + res.data.port;//获取websocket信息   ip + port
						/*实现化WebSocket对象，指定要连接的服务器地址与端口*/
						vm.webSocket = new WebSocket('ws://' + webSocketUrl + '/websocket');

						/*当网络连接建立时触发该事件*/
						vm.webSocket.onopen = function(event) {
							vm.webSocket.send(sendParam);//向远程服务器发送数据
						};
						
						/*当websocket接收到服务器发来的消息的时触发的事件*/
						vm.webSocket.onmessage = function(msg) {
							vm.list = null;
							if(msg.data == 0){
								vm.listLoading = false;
								Message.error({
									message:"参数不正确",
									duration: 1500
								});
								return;
							} else if(msg.data == 1){
								vm.listLoading = false;
								Message.warning({
									message:"车辆不在线",
									duration: 1500
								});
								return;
							} else {
								vm.webSocket.close();
								let getMessageTime = 0;
								vm.list = JSON.parse(msg.data);
								vm.getTimeData();
								vm.listLoading = false;
							}
						};
						let i = 0;
						let t = setInterval(
							function(){
								i++;
								if(i > 20 && vm.list == null){
									vm.listLoading = false;
									clearInterval(t);
								}
							},1000);
		            }else{
		                Message.error({message:"调用接口失败"});
		            }
		        }).catch(error => {
		        	vm.listLoading = false;
		        });
			},
			//获取服务器端的文件
			getServerFileList() {
				var vm = this;

				vm.listLoading = true;
				vm.timeVisible = false;
				vm.fileVisible = true;
				vm.showBtn = false;
				vm.hideBtn = true;

				var date = utils.turnTime(this.$refs.inputDate.value)

				vm.selectVideoData.fromTime = date + " " + vm.fromTime;//开始时间
				vm.selectVideoData.toTime = date + " " + vm.toTime;//结束时间
				vm.$instance.get("/proxy/monitor/historyVideo/findHistoryVideo", {params: JSON.parse(JSON.stringify(vm.selectVideoData))}).then(res =>{
					vm.listLoading = false;
		          	if(res.status == 200){						
						vm.list = res.data;
						  
						vm.timeImgsData.channelOneData = '';
		        		vm.timeImgsData.channelTwoData = '';
		        		vm.timeImgsData.channelThreeData = '';
		        		vm.timeImgsData.channelFourData = '';
		            }else{
		                Message.error({message:"调用接口失败"});
		            }
		        }).catch(error => { vm.listLoading = false;});
			},
			
			//控制条的显示隐藏
			controlShowHide(flag){
				if(flag){
					this.controlHeight = '60px';
				} else {
					this.controlHeight = '6px';
					this.speedBox = false;
				}
			},
			
			//点击播放/暂停按钮时，判断是播放还是关闭
			closeOrPlayVideo(index, row, event){
				var vm = this;
				let _this = event.target;
				let title = _this.getAttribute('title');
				if (title == '播放') {
					/*在点击播放之前先判断是否有正在播放的视频，如果有先关闭后播放，如果没有，直接播放*/
					//obj:当前播放的视频信息  true:有播放的视频    false:不存在播放的视频
					let obj = this.list.find((item) => {
						if(item.hasOwnProperty('status')){
							return item.status == true;
						}					
					});
					if(obj){
						obj.status = false;
						vm.stopParam.carId = vm.playParam.carId;
						vm.stopParam.channel = vm.playParam.channel;
						vm.slider = 0;
						vm.closeVideo(vm.stopParam, '', 'play', index, row, event);
					} else {
						vm.playVideo(index, row, event);
					};
				} else{
					//调用关闭函数
					vm.closeVideo(vm.stopParam, vm.msg2);
					if(!vm.list){

					}
					vm.list[vm.playVideoData.index].status = !vm.isPlay;//同时改变播放、暂停按钮的状态
					vm.videoCarName = "";
					vm.videoChannel = "";
					vm.videoTime = "";
				}
			},
			
			//视频播放
			 playVideo(index, row, event) {
				var vm = this;
				vm.videoPlayUrl = "rtmp://" + vm.videoServerUrl + "/live/" + row.phone + "-" + row.channel;
				
				vm.$set(this.list[index], 'status', true);
				//参数
				vm.playParam.carId = vm.selectVideoData.carId;//车辆ID
				vm.playParam.channel = row.channel;
				vm.playParam.startTime = vm.setTime(row.startTime, "date");//开始时间
		        vm.playParam.endTime = vm.setTime(row.endTime, "date");//结束时间
		        vm.playParam.index = index;
		        vm.playParam.ST = row.startTime;//开始时间
		        vm.playParam.ET = row.endTime;//结束时间
		        
		        let videoTime = new Date(Date.parse(row.endTime.replace(/-/g,"/"))).getTime() - new Date(Date.parse(row.startTime.replace(/-/g,"/"))).getTime();//视频总时长
		        let tt = vm.MillisecondToDate(videoTime);
		        vm.videoTime = tt;
		        
		        //参数
				vm.stopParam.carId = vm.selectVideoData.carId;//车辆ID
				vm.stopParam.channel = row.channel;
		        //调用播放函数
				vm.openVideo(vm.playParam);
				vm.videoChannel = "CH" + row.channel;//显示视频播放的通道号
				vm.videoCarName = vm.carNum;//显示视频播放的车牌号
				vm.timeVisible = false;
				vm.fileVisible = false;
				vm.showBtn = true;
				vm.hideBtn = false;
			
			},
			
			//控制条播放、暂停
			controlCloseVideo(){			
				var vm = this;
				if(!vm.list){
					this.$message({
			          	message: '暂无视频播放',
			          	type: 'warning',
			          	duration: '1500'
					});
					return
				}
				vm.list[vm.playVideoData.index].status = !vm.isPlay;//同时改变播放、暂停按钮的状态
				vm.closeVideo(vm.stopParam, vm.msg2);
				vm.videoCarName = "";
				vm.videoChannel = "";
				vm.videoTime = "";
			},
			
			//播放视频
			openVideo(dateInfo){
				let vm = this;
				let param = JSON.parse(JSON.stringify(dateInfo));
				delete param.index;
				delete param.ET;
				delete param.ST;
				let H = vm.$refs.backVideo.clientHeight;
				let W = vm.$refs.backVideo.clientWidth - 1;
				vm.$instance.post("/proxy/monitor/historyVideo/playVideo", param).then(res =>{
					if(res.status == 200){
						if (res.data.success) {
							vm.playVideoData.channel = dateInfo.channel;
							vm.playVideoData.carId = vm.selectVideoData.carId;
							vm.playVideoData.index = dateInfo.index;
							let clickPlayTime = new Date();//获取视频开始播放时，服务器上的时间
							vm.playTime = clickPlayTime.getHours() * 3600 + clickPlayTime.getMinutes() * 60 + clickPlayTime.getSeconds() * 1;
							vm.setPlayer();
							vm.videoStyle.width = $('#videoPlayer').width();
							vm.videoStyle.height = $('#videoPlayer').height();
						} else {
							Message.error({message:res.data.errorMsg});
						}						
					}else{
						Message.error({message:"调用接口失败"});
					}
				}).catch(error => {
					Message.error(
						{message:"播放失败！"}
					);
				});
			},
			
			videoTimer() {
				var vm = this;
				//定时心跳
				vm.myHeart = setInterval(function() {
					vm.setVideoHeart();
					let nowSerTime = new Date();//每30s获取一次服务器上的时间
					let newDate = nowSerTime.getHours() * 3600 + nowSerTime.getMinutes() * 60 + nowSerTime.getSeconds() * 1;
					let vidTime = newDate - vm.playTime;
					if(vm.videoCloseTime > 0 && vidTime >= vm.videoCloseTime){
						vm.closeVideo(vm.stopParam, vm.msg1);
						vm.list[vm.playVideoData.index].status = false;//同时改变播放、暂停按钮的状态
						return;
					}
				}, 30000)
			},
			
			/*关闭视频
			* type, index, row, event参数只有先关闭后播放时才有值
			*
			* */
			closeVideo(param, info, type, index, row, event) {
				var vm = this;
				vm.$instance.post("/proxy/monitor/historyVideo/videoControl", param).then(res =>{
		         	if(res.status == 200){
		          		if(info != ''){
		          			let tipType = 'success';
		          			if(info == vm.msg1){
		          				tipType = 'warning';
		          			}
		          			vm.$message({
					          	message: info,
					          	type: tipType,
					          	duration: '1500'
					        });
		          		}
		          		let obj = vm.list.find((item) => {
							if(item.hasOwnProperty('status')){
								return item.status == true;
							}					
						});
						if(obj){
							obj.status = false;
						}
						clearInterval(vm.myHeart);//关闭定时器(心跳)
						$('#videoPlayer').html('');
						vm.slider = 0;
						vm.speed = 0;
						vm.direction = '';
						vm.selectSpeed = 1;
						vm.speedBox = false;
						vm.stopParam.carId = '';
						if (type) {//如果是播放其他的，需先关闭正在播放的再播放当前视频
							vm.playVideo(index, row, event);
						}
		            }else{
		                Message.error({message:"调用接口失败"});
		            }
		        }).catch(error => {
		        	Message.error(
						{message:"视频关闭失败！"}
					);
		        });
			},
			
			/*
				快进、快退 
				direction:  3快进   4 快退
			*/
			speedBoxShowHide(direction){
				var vm = this;
				var len = document.getElementsByTagName('object').length;//判断是否有视频在播放
				if (len == 0) {
					this.$message({
			          	message: '暂无视频播放',
			          	type: 'warning',
			          	duration: '1500'
			        });
					return;
				} else {
					vm.speedBox = true;
					vm.direction = direction;
				}
			},
			
			//设置快进、快退速度
			setPlaySpeed(val){
				var vm = this;
				let param = {
					carId: vm.playVideoData.carId,
					channel: vm.playVideoData.channel,
					controlCmd:　vm.direction,//	回放控制
					speed: val,//快进快退倍数
				}
				vm.$instance.post("/proxy/monitor/historyVideo/videoControl", param).then(res =>{
		          if(res.status == 200){
						vm.setPlayer();
						vm.selectSpeed = val;
						vm.speedBox = false;
		            }else{
		                Message.error({message:"调用接口失败"});
		            }
		        }).catch(error => {
		        	Message.error(
						{message:"播放失败！"}
					);
		        });
			},
			
		//拖动滑块
			//改变滑动条上的值
			formatTooltip(val) {
				var vm = this;
				if(vm.playParam.startTime == '' || vm.playParam.endTime == ''){
					return;
				}
				let allTime = new Date(Date.parse(vm.playParam.ET.replace(/-/g,"/"))).getTime() - new Date(Date.parse(vm.playParam.ST.replace(/-/g,"/"))).getTime();
				let time = parseInt(allTime * (vm.slider) * 0.01);
				
				if(val == 0){
					vm.controlSliderTip = "00:00:00";
				} else {
					vm.controlSliderTip = vm.MillisecondToDate(time);
				}
				return vm.controlSliderTip;
		    },
			
			//拖动滑块时下发指令
		    sliderChange() {
		    	var vm = this;
		    	if(vm.playParam.carId == ''){//验证无视频
		    		vm.slider = 0;
		    		this.$message({
			          	message: '暂无视频播放',
			          	type: 'warning',
			          	duration: '1500'
			        });
		    		return;
		    	}
		    	if(!vm.isPlay){//验证关闭状态时
		    		vm.slider = 0;
		    		this.$message({
			          	message: '视频已关闭',
			          	type: 'warning',
			          	duration: '1500'
			        });
		    		return;
		    	}
		    	/*@param:
		    	 * 	newDates:最新的日期   YYYY-MM-DD hh:mm:ss
		    	 *  startDay:开始时间的   日
		    	 *  endDay:结束时间的   日
		    	 * 	startSecond:开始时间   hh:mm:ss
		    	 * 	D:  拖动完成时的日期   YYYY-MM-DD 
		    	 *  S:  拖动完成时的   总秒数  需转为 hh:mm:ss
		    	 * 	s1: 开始时间的秒数
		    	 * 	s2: 滑块上显示时间的秒数  即走过的时长
		    	 * */
		    	let newDates = "", startDay = "", endDay = "", startSecond = "", D, S, s1, s2, player;
		    	let sliderParam = {
					carId: vm.playVideoData.carId,
					channel: vm.playVideoData.channel,
					controlCmd:　5,//拖动回放
				}
		    	startDay = vm.playParam.ST.substring(8,10);//开始时间的   日
		    	endDay = vm.playParam.ET.substring(8,10);//结束时间的   日
		    	
		    	startSecond = vm.playParam.ST.split(" ")[1];
		    	s1 = vm.time_to_sec(startSecond);//开始时间的秒数
		    	s2 = vm.time_to_sec(vm.controlSliderTip);//滑块上显示时间的秒数  即走过的时长
		    	//通过比较startDay、endDay来判断视频是否跨天
		    	if(startDay == endDay){
		    		D = vm.playParam.ST.split(" ")[0];
		    		S = s1 + s2;//总秒数
		    	} else {
		    		let videoAllTime = vm.time_to_sec(vm.videoTime);//视频总时长
		    		let proportion = ((vm.timeLength - s1) / videoAllTime) * 100;//前一天的剩余时间占整天的比例
		    		if(proportion > vm.slider){
			    		D = vm.playParam.ST.split(" ")[0];
			    		S = s1 + s2;//总秒数
		    		} else {
		    			D = vm.playParam.ET.split(" ")[0];
		    			S = s2 - (vm.timeLength - s1);
		    		}
		    	}
		    	 
		    	let newTime = vm.sec_to_time(S);
		    	newDates = D + " " + newTime;
		    	sliderParam.time = vm.setTime(newDates, "date");//拖动回放位置
		    	
				vm.$instance.post("/proxy/monitor/historyVideo/videoControl", sliderParam).then(res =>{
		          if(res.status == 200){
						vm.setPlayer();
		            }else{
		                Message.error({message:"调用接口失败"});
		            }
		        }).catch(error => {
		        	Message.error(
						{message:"视频播放失败！"}
					);
		        });
		    },
			
			//设置视频播放器
			setPlayer() {
			    cyberplayer('videoPlayer').setup({
					width: '100%',
					height: '100%',
					file: this.videoPlayUrl, // <—rtmp直播地址
					autostart: true,
					stretching: "exactfit",
					volume: 100,
					controls: true,
					rtmp: {
						reconnecttime: 200000000000000, // rtmp直播的重连次数
						bufferlength: 1 // 缓冲多少秒之后开始播放 默认1秒
					},
					ak: "xxxxxxxxxxxxxxxx" // 公有云平台注册即可获得accessKey
				});
			},

			//判断是否全屏
			checkFull() {
				var isFull =  document.fullscreenEnabled || window.fullScreen || document.webkitIsFullScreen || document.msFullscreenEnabled;
				if(isFull === undefined) isFull = false;
				return isFull;
			},
			
			//全屏
			fullScreen() {
				var len = document.getElementsByTagName('object').length;//判断是否有视频在播放
				if (len == 0) {
					this.$message({
			          	message: '暂无视频播放',
			          	type: 'warning',
			          	duration: '1500'
			        });
					return;
				} else { 
					this.isFullScreen = !this.isFullScreen;
					if(this.isFullScreen){//开启全屏
						var width = window.screen.width;
						var height = window.screen.height;
						var video = $('#backVideo')[0];
						$("#backVideo").css({
							'width': width,
							'height': height
						});
						$("#videoPlayer").css({
							'width': width,
							'height': height
						})
						this.launchFullscreen(video);//开启全屏
					} else {//退出全屏
					if(this.isIe){
							this.isIe = false
						}
						this.exitFull();
					}
				}
			},
			
			//退出全屏
			exitFull() {
				$("#backVideo").css({
					'width': this.videoStyle.width,
					'height': this.videoStyle.height
				});
				$("#videoPlayer").css({
					'width': this.videoStyle.width,
					'height': this.videoStyle.height
				})
				this.isFullScreen = false;//改变全屏按钮状态
				this.exitFullscreen();//退出全屏
			},
			
			//获取设置关闭视频时间
			getCloseVideoTime(){
				let vm = this;
				let param = {};
				vm.$instance.get("/proxy/sysmgr/account/findConfig", {params: param}).then(res =>{
		          if(res.status == 200){
		          		vm.videoCloseTime = res.data.closeVideo * 60;
		            }else{
		                Message.error({message:"调用接口失败"});
		            }
		        }).catch(error => {
		        	Message.error(
						{message:"获取视频关闭时间失败！"}
					);
		        });
			},
			
			//音视频心跳
			setVideoHeart(){
				let vm = this;
				let videoArr = [];
				videoArr.push({
					carId: vm.playParam.carId,
					channels: [parseInt(vm.playParam.channel)],
				})
				let params = {
					data : JSON.stringify(videoArr)
				}
				vm.$instance.post("/proxy/monitor/video/videoHeart", params).then(res =>{
		          	if(res.status == 200){
						if (res.data.success) {
							//  console.log("视频心跳")
						} else {
							Message.error({message:res.data.errorMsg});						
						}
					}else{
						Message.error({message:"调用接口失败"});
					}
		        }).catch(error => {
		        	Message.error(
						{message:"获取音视频心跳失败！"}
					);
		        });
			},
			
			//处理时间参数
			setTime(time, type){
				let startDateArray = "";
				let timeArray = "";
				if (type == "time") {
					startDateArray = utils.turnTime(this.$refs.inputDate.value).split("-");
					timeArray = time.split(":");
				} else if(type == "date"){
					let timeArr = time.split(" ");
					startDateArray = timeArr[0].split("-");
					timeArray = timeArr[1].split(":");
				}
				return startDateArray[0].substring(2,4) + startDateArray[1] + startDateArray[2] + timeArray[0] + timeArray[1] + timeArray[2];
			},
			
		    //时:分:秒  转为  秒
		    time_to_sec(time){
		    	let timeArray = "";
		    	if(time == undefined){
		    		return;
		    	}
		    	if(time.length > 8){
		    		let timeArr = time.split(" ");
		    		timeArray = timeArr[1].split(":");
		    	} else {
		    		timeArray = time.split(":");
		    	}
		    	let second = timeArray[0] * 3600 + timeArray[1] * 60 + parseInt(timeArray[2]);
		    	return second;
		    },
		    
		    //秒  转为  时:分:秒
		    sec_to_time(second) {
		        let t;
		        if(second > -1){
		            let hour = Math.floor( second / 3600 );
		            let min = Math.floor( second / 60 ) % 60;
		            let sec = second % 60;
					t = utils.checkTimeAdd0(hour) + ":" + utils.checkTimeAdd0(min) + ":" + utils.checkTimeAdd0(sec);
		        }
		        return t;
		    },
		    
		    //计算视频总时长(格式化)
			MillisecondToDate(msd) {
			    let time = parseFloat(msd) / 1000;  
			    if (null != time && "" != time) { 
			    	let t = time / 3600.0;
			    	let h = parseInt(t);
			    	let m = parseInt((parseFloat(t) - h) * 60);
			    	let s = parseInt((parseFloat((parseFloat(t) - h) * 60) - m) * 60) + 1;
		            time = utils.checkTimeAdd0(h) + ":" + utils.checkTimeAdd0(m) + ":" + utils.checkTimeAdd0(s);
			    }  
				return time;
			}, 
			
			//進入全屏
			launchFullscreen(element) {
				//此方法不可以在異步任務中執行，否則火狐無法全屏
				if(element.requestFullscreen) {
					element.requestFullscreen();
				} else if(element.mozRequestFullScreen) {
					element.mozRequestFullScreen();
				} else if(element.msRequestFullscreen) {
					element.msRequestFullscreen();
				} else if(element.oRequestFullscreen) {
					element.oRequestFullscreen();
				} else if(element.webkitRequestFullscreen) {
					element.webkitRequestFullScreen();
				} else {
                    this.isIe = true;
					let height = document.body.clientHeight
					this.$refs.backVideo.style.position = 'absolute';
					this.$refs.backVideo.style.zIndex = '5000';
					this.$refs.backVideo.style.left = 0;
					this.$refs.backVideo.style.top = '-70px'
					this.$refs.backVideo.style.width = '100%';
					this.$refs.backVideo.style.height = height + 80 +'px';	
					this.$refs.backVideo.style.overflow = 'hidden';						
					document.IsFullScreen = true;
				}
			},
			//退出全屏
			exitFullscreen() {
				if(document.exitFullscreen) {
					document.exitFullscreen();
				} else if(document.msExitFullscreen) {
					document.msExitFullscreen();
				} else if(document.mozCancelFullScreen) {
					document.mozCancelFullScreen();
				} else if(document.oRequestFullscreen) {
					document.oCancelFullScreen();
				} else if(document.webkitExitFullscreen) {
					document.webkitExitFullscreen();
				} else {
					this.isIe = false
	                this.$refs.backVideo.style.position = '';
					this.$refs.backVideo.style.zIndex = '';
					this.$refs.backVideo.style.left = 0;
					this.$refs.backVideo.style.top = ''
					this.$refs.backVideo.style.width = '';
					this.$refs.backVideo.style.height = '';	
					this.$refs.backVideo.style.overflow = '';			
					document.IsFullScreen = false;
				}
			},
			
			//获取表格内数据中的时间(startTime, endTime)，重新组成数组
			getTimeData(){
				var vm = this;
				for (var i=0; i<vm.list.length; i++) {
					let channel = vm.list[i].channel;
					let newData = {};
						newData.startTime = vm.list[i].startTime;
						newData.endTime = vm.list[i].endTime;
					switch (channel){
						case "1":
							this.timeData.channel1.push(newData);
							break;
						case "2":
							this.timeData.channel2.push(newData);
							break;
						case "3":
							this.timeData.channel3.push(newData);
							break;
						case "4":
							this.timeData.channel4.push(newData);
						default:
					}
				}
				vm.drawTime();
			},
			
		//视频下载任务查询
			//打开选择车辆弹框
			getDownCarId(){
				this.departData.dialog = true;
				this.departData.currentKeys = [];
				if (this.taskParamsTemp.carId) {
					this.departData.currentKeys.push(this.taskParamsTemp.carId);
				}
			},
			//子节点取消
			clearDownCar(param){
				this.taskParamsTemp.carId = "";//选中的车ID
				this.carDownNum = "";
			},
			
		//视频查询
			//打开选择车辆弹框
			getCarId(){
				this.departData.dialog = true;
				this.departData.currentKeys = [];
				if (this.selectVideoData.carId) {
					this.departData.currentKeys.push(this.selectVideoData.carId);
				}
			},
			//子节点取消
			clearCar(param){
				this.selectVideoData.carId = "";//选中的车ID
				this.carNum = "";
			},

			//关闭组织机构弹框
			closeDepart(param){
				this.departData.dialog = false;
			},
			//确定选择车辆
			getCar(nodes){
				if(nodes.carId){
					if (!this.taskFormVisible) {
						this.selectVideoData.carId = nodes.carId;//选中的车ID(视频搜索)
						this.carNum = nodes.name;//车牌号
					} else {
						this.taskParamsTemp.carId = nodes.carId;//选中的车ID(下载任务弹框)
					    this.carDownNum = nodes.name;//车牌号
					}
					this.departData.dialog = false;
				}
			},
		    
		    //Tab的显示隐藏
		    tabShow(index) {
		    	this.tabindex = index;
		    	if (index == 0) {
		    		this.timeVisible = false;
					this.fileVisible = true;
					this.showBtn = false;
					this.hideBtn = true;
		    	} else if (index == 1) {
					this.timeVisible = true;
					this.fileVisible = false;
					this.showBtn = false;
					this.hideBtn = true;
		    	}
		    },
		    //展开
		    tabConShow(){
		    	this.timeVisible = false;
				this.fileVisible = true;
				this.showBtn = false;
				this.hideBtn = true;
		    },
		    //收回
		    tabConHide(){
		    	this.timeVisible = false;
				this.fileVisible = false;
				this.showBtn = true;
				this.hideBtn = false;
				this.tabindex = 0;//收回时Tab颜色的切换
		    },
		    
		    //查看下载任务
		    downloadTaskShow(){
		    	this.taskFormVisible = true;
				this.getList(true);
		    },
		    
		    //搜索下载任务列表
		    getList(isBackHome = false) {
				if (isBackHome) {
					if (this.taskParamsTemp.iDisplayStart != 0) {
						this.$refs.page.backFirstPage();
						return;
					}
				}

		    	var vm = this;
		    	vm.taskParamsTemp.fromTime = '';
		    	vm.taskParamsTemp.toTime = '';
				//调用接口
				if (vm.$refs.datePicker) {//判断是否创建时间
					const dateTime = vm.$refs.datePicker.dateTimePicker;//父组件获取子组件数据this.$refs.第一个datePicker是父组件ref值，第二个是子组件model值
					if(dateTime){
						vm.taskParamsTemp.fromTime = dateTime[0];
						vm.taskParamsTemp.toTime = dateTime[1];
					}
				}
				let param = JSON.parse(JSON.stringify(vm.taskParamsTemp));
		        vm.$instance.post("/proxy/monitor/historyVideo/findOfflineTask", param).then(res =>{
		          if(res.status == 200){
		                vm.taskList = res.data.data;
						vm.total = res.data.contTotal;
		            }else{
		                Message.error({message:"调用接口失败"});
		            }
		        }).catch(error => {
		        	
		        });
		    },
		    
		    //关闭离线任务弹框 清空表单
		    closeTaskDialog(){	
		        this.taskParamsTemp.iDisplayLength = 10;
		        this.taskParamsTemp.iDisplayStart = 0;
		        this.taskParamsTemp.carId = '';
		        this.taskParamsTemp.fromTime = '';
		        this.taskParamsTemp.toTime = '';
		        this.taskParamsTemp.status = '';
			},
		    
		    /**
			 * 分页改变，加载数据
			 */
			paginationChange(pageData) {
				this.taskParamsTemp.iDisplayStart = pageData.iDisplayStart;
				this.taskParamsTemp.iDisplayLength = pageData.iDisplayLength;
				this.getList();
			},
			
			//下载服务器上的视频
			downloadServiceVideo(fileUrl) {			
				let $iframe = $('<iframe id="down-file-iframe" />');
				let $form = $('<form method="get" />');
				$form.attr('action', "/proxy/ftpDownload");

				$form.append('<input type="hidden" name="url" value="' + fileUrl + '" />');

				$iframe.append($form);
				$(document.body).append($iframe);
				$form[0].submit();
				$iframe.remove();
            },
			//下载
			downloadVideo(index, row) {
				var vm = this;
				if (row.location != 1) {
					vm.downloadServiceVideo(row.fileUrl);
					return;
				}
				let param = {
					carId : vm.selectVideoData.carId,
					fromTime : row.startTime,
					toTime :row.endTime,
					channel : row.channel
				};
				vm.$instance.get("/proxy/monitor/historyVideo/offlineDownvideo", {params: param}).then(res =>{
					if(res.status == 200){
						if (res.data.success) {
							Message.success({message: '指令下发成功！'});
							vm.getList();
						} else {
							Message.error({message:res.data.errorMsg});
						}						
					}else{
						Message.error({message:"调用接口失败"});
					}
				}).catch(error => {Message.error({message:"指令下发失败！"});});	
			},
			
			//画时间图形
			drawTime() {
				this.timeImgsData.channelOneData = this.getHtml(this.timeData.channel1);
				this.timeImgsData.channelTwoData = this.getHtml(this.timeData.channel2);
				this.timeImgsData.channelThreeData = this.getHtml(this.timeData.channel3);
				this.timeImgsData.channelFourData = this.getHtml(this.timeData.channel4);
			},

			getHtml(data) {
				var html = '';
				for (var i=0; i<data.length; i++) {
					var startTime = parseInt(data[i].startTime.slice(11,13) * 3600 
									+ data[i].startTime.slice(14,16) * 60 
									+ data[i].startTime.slice(17) * 1);
					var endTime = parseInt(data[i].endTime.slice(11,13) * 3600 
									+ data[i].endTime.slice(14,16) * 60 
									+ data[i].endTime.slice(17) * 1);
					var timeDifference = endTime - startTime;
					var left = (startTime / this.timeLength * 100).toFixed(2) + '%';
					var width = (timeDifference / this.timeLength * 100).toFixed(2) + '%';
					html += "<div style='width:" + width + ";left:" + left + "'></div>";
				}
				return html;
			},
			
			//当前鼠标距目标div左边的距离
			getX(obj) {
				var parObj = obj;
				var left = obj.offsetLeft;
				while(parObj = parObj.offsetParent) {
					left += parObj.offsetLeft;
				}
				return left;
			},
			//当前鼠标距目标div顶部的距离
			getY(obj) {
				var parObj = obj;
				var top = obj.offsetTop;
				while(parObj = parObj.offsetParent) {
					top += parObj.offsetTop;
				}
				return top;
			},
			
			//鼠标移动时执行的函数
			displayCoord(event) {
				var top, left, oDiv;
				oDiv = this.$refs.demo;
				var width = oDiv.firstChild.offsetWidth;
				var halfWidth = width / 2;
				top = this.getY(oDiv);
				left = this.getX(oDiv);
				var lineLeft = event.clientX - left;
				var topHeight = event.clientY - top;

				if (topHeight > 190) {
					topHeight = 190;
				}
				
				if(lineLeft > width){
					lineLeft = width;
				}

				if(lineLeft > halfWidth){
					this.left = '-100px';
				} else {
					this.left = '0';
				}
				
				//修改显示通道号
				if (topHeight <= 55) {
					this.channelNum = 'CH1';
				} else if(topHeight > 55 && topHeight <= 110) {
					this.channelNum = 'CH2';
				} else if(topHeight > 110 && topHeight <= 155) {
					this.channelNum = 'CH3';
				} else if(topHeight > 155) {
					this.channelNum = 'CH4';
				}

				var secondTime = '00'; 
				var minuteTime = '00'; 
				var hourTime = '00';
				//修改当前显示时间
				secondTime = Math.ceil(lineLeft * this.timeLength / width);
				if(secondTime > 60) {//如果秒数大于60，将秒数转换成整数
		            //获取分钟，除以60取整数，得到整数分钟
		            minuteTime = parseInt(secondTime / 60);
		            
		            //获取秒数，秒数取佘，得到整数秒数
		            secondTime = parseInt(secondTime % 60);
		            //如果分钟大于60，将分钟转换成小时
		            if(minuteTime > 60) {
		                //获取小时，获取分钟除以60，得到整数小时
		                hourTime = parseInt(minuteTime / 60);
		                
		                //获取小时后取余的分，获取分钟除以60取余的分
		                minuteTime = parseInt(minuteTime % 60);
		            }
		        }
				
				if(secondTime < 10 && secondTime > 0){
                	secondTime =  "0" + secondTime;
               	} else if (secondTime <= 0) {
               		secondTime =  "00";
               	}
				
				if(minuteTime < 10 && minuteTime > 0){
                	minuteTime =  "0" + minuteTime;
                } else if (minuteTime <= 0) {
               		minuteTime =  "00";
               	}
				
				if(hourTime < 10 && hourTime > 0){
                	hourTime =  "0" + hourTime;
                } else if (hourTime <= 0) {
               		hourTime =  "00";
               	}
				
				var result = hourTime + ":" + minuteTime + ":" + secondTime;
				
		        this.nowTime = result;
				this.showBoxLeft = lineLeft + "px";//设置竖线距左边的距离
				this.top = topHeight + "px";//设置显示时间box距顶部的距离
			},
			
		}
	}	
</script>
<style rel="stylesheet/scss" lang="scss">
	@import "src/assets/css/mixin.scss";
	.tab-active{
		background: #566fc9 !important;
		color: #fff !important;
	}
	.video-back-con{
		background: none;
		.video-title{
			@include height(42px);
			padding-left: 25px;
			color: #45506a;
		}
		.select-box{
			width: 16%;
			background: #fff;
			z-index: 1;
			.select-car{
				.el-form-item__content{
					width: 100%;
				}
				.el-form-item{
					margin: 0;
				}
			}
			.selBtn{
				text-align: center;
			}
			.el-radio__inner{
				@include size(12px, 12px);
			}
		}
		
		.select-box>div{
			padding: 0 20px 15px 20px;
			@at-root & {
		        @media all and (max-width: 1400px)  {
		            & {
		                padding: 0 20px 8px 20px;
		            }
		        }
		    }
			border-bottom: 1px solid #f3f4f6;
			.select-title{
				padding: 15px 0 0 0;
				color: #494949;
				font-size: 14px;
				@at-root & {
			        @media all and (max-width: 1400px)  {
			            & {
			                padding: 5px 0 0 0;
			                font-size: 12px;
			            }
			        }
			    }
			}
			.el-date-editor.el-input, .el-date-editor.el-input__inner, .el-input{
				width: 100%;
			}
			.el-radio span{
				@at-root & {
			        @media all and (max-width: 1400px)  {
			            & {
			                font-size: 12px;
			            }
			        }
			    }
			}
		}
		.select-box{
			.el-form-item{
				width: 100%;
			}
		}
		.select-box>div>div,.el-radio{
			margin-top: 15px;
			@at-root & {
		        @media all and (max-width: 1400px)  {
		            & {
		                margin-top: 8px;
		            }
		        }
		    }
		}
		.videoShow-box{
			width: 83.5%;
			position: relative;
			background: #fff;
			overflow-x: hidden;
			overflow-y: auto;
			.back-video-box{
				width: 100%;
				overflow: hidden;
				.back-video{
					width: 100% !important;
					position: relative;
					background-color: #000;
					background-image: url(../../assets/img/videoBcakBg.png);
					background-repeat: no-repeat;
					background-position: center center;
					#videoPlayer{
						background-color: #000;
						background-image: url(../../assets/img/videoBcakBg.png);
						background-repeat: no-repeat;
						background-position: center center;
					}
					.video-control{
						position: absolute;
						bottom: 0;
						left: 0;
						width: 100%;
						cursor: pointer;
						background: rgba(0,0,0,.6);
						transition:all .3s;
						.el-slider__runway{
							margin: 0;
						}
						ul{
							display: inline-block;
							width: 100%;
							padding: 0 20px;
							li{
								display: inline-block;
								@include height(50px);
								span{
									color: #fff;
									margin-right: 20px;
								}
							}
						}
						.controlSpeed{
							background: rgba(0, 0, 0, 0.6);
							width: 138px;
							padding: 10px;
							position: absolute;
							bottom: 60px;
							right: 50px;
							z-index: 10;
							span{
								display: inline-block;
								text-align: center;
								@include size(30px, 20px);
								@include height(20px);
								@include cursor;
								background: rgba(0, 0, 0, 0.6);
								margin: 4px 3px;
								color: #fff;
								font-size: 12px;
							}
							.speed-active{
								background: #566fc9;
							}
						}
					}
				}
			}
			.table-box{
				width: 100%;
				position: absolute;
				background: #fff;
				bottom: 0;
				z-index: 1002;
				min-height: 40px;
				ul{
					display: block;
					width: 100%;
					height: 40px;
					background: #fff;
				}
				li.fl button{
					border-radius: 0;
					padding: 12px 45px;
					float: left;
					margin: 0;
					border-left: none;
					background: #f2f2f2;
				}
				li.fr{
					padding-right: 20px;
					button{
						padding: 5px;
						margin-top: 6px;
					}
				}
				.show-time{
					width: 100%;
					height: 285px;
					padding: 0 20px;
					.timeImgs-box{
						border-top: 1px solid #DEDEDE;
						width: 96%;
						height: 220px;
						margin: 0 auto;
						position: relative;
						.channel {
							width: 100%;
							height: 55px;
							border-bottom: 1px solid #DEDEDE;
							div{
								height: 55px;
								position: absolute;
								background: #99CCFF;
							}
						}
						.to_top{
							position: absolute;
							width: 2px !important;
							height: 220px;
							background: #3399FF;
							z-index: 10;
							left: 0;
							top: 0;
							.show-con{
								position: relative;
								width: 100px;
								@include height(30px);
								text-align: center;
								background: #3399FF;
								span{
									font-size: 14px;
									color: #fff;
								}
							}
						}
					}
					.time-box{
						width: 100%;
						height: 65px;
						margin: 0 auto;
						overflow: hidden;
						ul{
							display: block;
							width: 100%;
							margin-left: 2%;
							li{
								display: inline-block;
								width: 4%;
								height: 30px;
								border-left: 1px solid #DEDEDE;
								position: relative;
								float: left;
								span{
									position: absolute;
									top: 33px;
									left: -15px;
									font-size: 12px;
								}
							}
						}
					}
				}
			}
		}
	}
	.taskLayerBox .el-dialog__body{
		padding-bottom: 20px;
	}
</style>