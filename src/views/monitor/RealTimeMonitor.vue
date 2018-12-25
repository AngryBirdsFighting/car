
/**
 * @Author:      wangchao
 * @DateTime:    2018-03-21
 * @Description: 实时监控组件
 */
<template>
	<div class="app-container container" :class="slidebar ?  'container' : 'container1'">
		<div class="fl tree-box" ref="treeBox">
			<ul class="tree-title">
				<li class="fl">车队列表</li>
				<li class="fr imgs-type">
					<img src="../../assets/img/tree_tip.png" @mouseover="tipImgsShow" @mouseleave="tipImgsHide" />
					<div class="type_box" v-if="imgsTypeVisible">
						<ul>
							<li><img src="../../assets/img/car-online.png" />在线</li>
							<li><img src="../../assets/img/car-out.png" />离线</li>
							<li><img src="../../assets/img/car-stop.png" />怠速</li>
							<li><img src="../../assets/img/car-tip.png" />报警</li>
							<li><img src="../../assets/img/car-noactive.png" />未激活</li>
						</ul>
					</div>
				</li>
			</ul>
			<el-input placeholder="搜索车辆..." class="select-tree-input" v-model="filterText"></el-input>
			<div class="tree-list" ref="elTree">
				<el-tree				
					:data="treeData" 
					@node-contextmenu="showMeau" 
					@node-click="openAisleOrGetVideo" 
					node-key="id" 
					:expand-on-click-node="false" 
					:render-content="renderContent" 
					:filter-node-method="filterNode"
					:default-expanded-keys="defaultOpenNodes"
					@node-collapse="nodeCollapse"
					@node-expand="nodeExpand"
					:class="treeStyle"
					ref="tree2"
					v-loading="treeLoad"
					element-loading-text="拼命加载中">
				</el-tree>
			</div>
			<div v-if="videoReadyData.gpsInterval" class="gpsInterval">每隔{{videoReadyData.gpsInterval}}秒自动更新</div>
		</div>
		<div class="fl video-container" ref="videoCon">
			<div class="operation" ref="operation">
				<i class=" icon-c-one" @click="editVideoGrid(1)" :class="('1'- defaultGrid) || 'icon-blue' "></i>
				<i class=" icon-c-four" @click="editVideoGrid(4)" :class="('4'- defaultGrid) || 'icon-blue' "></i>
				<i class=" icon-c-six" @click="editVideoGrid(6)" :class="('6'- defaultGrid) || 'icon-blue' "></i>
				<i class=" icon-c-nine" @click="editVideoGrid(9)" :class="('9'- defaultGrid) || 'icon-blue' "></i>
				<i class=" icon-c-sixteen" @click="editVideoGrid(16)"  :class="('16'- defaultGrid) || 'icon-blue' "></i>
				<i class="icon-c-twenty-five" v-show="videoReadyData.maxMonitor >= 25 || videoReadyData.maxMonitor  >= 36 " @click="editVideoGrid(25)" :class="('25'- defaultGrid) || 'icon-blue' ">25</i>
				<i class="icon-c-thirty-six"  v-show="videoReadyData.maxMonitor >= 36 " @click="editVideoGrid(36)" :class="('36'- defaultGrid) || 'icon-blue' ">36</i>
				<!-- <el-select v-model="videoRatio" size="small" class="select" placeholder="请选择比例">
					<el-option value="1" label="16:9"></el-option>
					<el-option value="2" label="4:3"></el-option>
				</el-select> -->
				<i class="video-ope icon-c-stops" v-if="permBtn.monitor_stop_all" @click="playAllAndStop()" title='停止全部'></i>
				<i class="video-ope icon-c-shezhi" v-if="permBtn.monitor_edit_video_para" title="设置" @click="videoSetVisible = true"></i>
				<i class="video-ope icon-c-quanping" title="全屏" @click="openFullscreen"></i>
			</div>
			<div class="video-box" ref="videos">
				<div style="color: blue; font-size:20px; z-index:0;" v-for="(item, index) in videoData" :key="index" v-if="index < defaultGrid"  class = "video-player-box" :class="videoClass">
					<div v-if="item.vid" class="video-player" :id="'videoPlayer'+index"></div>
					<div v-else class="video-player"  :id="'videoPlayer'+index" >						
					</div>
					<img v-if="!item.vid" class="video-bg" src="../../assets/img/videoBcakBg.png" alt="">
					<div class="video-control">
						<p class="video-icon" >
							<i class="video-con-icon icon-c-stop"  v-if="permBtn.monitor_play"  @click="playAndStopVideo(item, (item.status ? 0 : 3),$event)" title= '停止'></i>
							<!-- <i class="video-con-icon icon-c-quanping" title="全屏" @click="openOneFullscreen(item)"></i> -->
							<!-- <i  class="video-con-icon" v-if="permBtn.monitor_play" @click="closeMonitorByVideo(item)" title="监听"  :class="item.status && item.isM ? 'icon-c-sound' : 'icon-c-mute'"></i> -->
						</p>
						<p class="video-text">
							<span class="video-text-carNum" v-if="item.name && defaultGrid < 36">{{item.name}}</span> &nbsp;
							<span class="video-text-td" v-if="item.channels && defaultGrid < 36">CH{{item.channels}}</span>
						</p>
					</div>
					<!-- <i v-show="item.vid" class="el-icon-close" @click="closeVideo(item, index)"></i> -->
				</div>
			</div>
		</div>
		<div class="fr mapCon" v-bind:style="styleObject" ref="mapCon">
			<!--导入按钮以及弹框  start-->
			<p><i :class="isUnfold ? 'el-icon-arrow-left' : 'el-icon-arrow-right'" @click="unfoldMap()"></i>&nbsp;&nbsp;{{cityName}}</p>
			<depart-tree :departData="departData" @closeDialog="closeDepart($event)" @getCarIds="getCar($event)" @clearCars="clearCar($event)"></depart-tree>
			<!--组织机构获得车辆ID及弹框   end-->
			<b-map :alarmCar="carPlaceInfo" @showCityName="updateCity" ref="map">
			</b-map>
		</div>
		<span class="clear"></span>
		<el-dialog title="参数设置"  :visible.sync="videoSetVisible" top="10%" width="420px" lock-scroll :close-on-click-modal="false"
			:close-on-press-escape="false">
			<el-form class="small-space" ref="editDialogForm" :model="videoSetData"  label-position="left" label-width="170px">
				<el-form-item label="默认请求视频：">
					<el-select v-model="videoSetData.stream">
						<el-option v-for="item in videoSetDic.stream_type" :value="item.dictCode" :label="item.dictName" :key="item.dictName">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="自动关闭对讲和监听：">
					<el-select v-model="videoSetData.closeMonitor">
						<el-option v-for="item in videoSetDic.auto_close_monitor_time" :value="item.dictCode" :label="item.dictName" :key="item.dictName">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="自动关闭视频时间：">
					<el-select v-model="videoSetData.closeVideo">
						<el-option v-for="item in videoSetDic.auto_close_video_time" :value="item.dictCode" :label="item.dictName" :key="item.dictName">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="显示最高画面：">
					<el-select v-model="videoSetData.maxMonitor"  placeholder="请选择">
						<el-option
							v-for="item in videoSetDic.video_maximum"
							:value="item.dictCode"
							:label="item.dictName" 
							:key="item.dictName">
						</el-option>
				    </el-select>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="videoSetVisible = false">取 消</el-button>
				<el-button type="primary" @click.native.prevent="handleEditSubmit()" class="btnColor">确 定</el-button>
			</div>
		</el-dialog>
		<div ref="carMenu"  class="menu car-menu" @mouseleave="IsCarMenuShow = false" v-show="IsCarMenuShow">
			<p @click.prevent="playAisleAllVideo" v-if="permBtn.monitor_play_all">预览所有视频</p>
			<p @click.prevent="stopAisleAllVideo" v-if="permBtn.monitor_stop_all">停止所有视频</p>
		</div>
		<div ref="depMenu" v-if="permBtn.monitor_play_all" class="menu car-menu" @mouseleave="IsDepMenuShow = false" v-show="IsDepMenuShow">
		</div>
		<div ref="aisleMenu" v-if="permBtn.monitor_play" class="menu aisle-menu" @mouseleave="IsAisleMenuShow = false" v-show="IsAisleMenuShow">
			<p @click.prevent="openVideoByStream(0 , hostStream.status)">{{hostStream.btn}}</p>
			<p @click.prevent="openVideoByStream(1 , seedStream.status)">{{seedStream.btn}}</p>
			<p @click.prevent="openTalkpack(tStatus)">{{tokeBtn}}</p>
			<p @click.prevent="openMonitor(mStatus)">{{monitorBtn}}</p>
			<p @click.prevent="photograph()" >抓拍</p>
		</div>
		<el-dialog title="提示" :close-on-click-modal="false"
			:close-on-press-escape="false" :visible.sync="dialogVisible"  top="10%" width="488px" lock-scroll class="equimei-dialog">
			<div class="confirm">
				<div class="confirm-top">
					<i class="icon-c-zhuyi"></i>
					<span  class="confirm-text">
						 您确定要切换吗？切换后会删除多余视频！
					</span>
				</div>
			</div>
			<div slot="footer" class="dialog-footer">				
				<el-button @click="dialogVisible = false">取 消</el-button>
				<el-button type="primary" @click.native.prevent="handleClosevideos" class="btnColor">确 定</el-button>
			</div>
		</el-dialog>
	</div>
</template>
<script>
	import '../../assets/css/index.scss';
	import BMap from '../../components/BMap'; // 地图组件
	import Import from '../../components/Import'; // 导入弹框组件
	import DepartTree from '../../components/DepartTree'; // 组织机构弹框
	import { api } from 'src/global/api';
	import axios from 'axios';
	import { Message } from 'element-ui';
	import { utils } from 'src/utils';

	export default {
		components: {
			'b-map': BMap,
			import: Import,
			'depart-tree': DepartTree,
		},
		data() {
			return {
				textDialogVisible: false, // 下发文本弹窗显示隐藏
				// 组织机构树
				departData: {
					dialog: false // 弹框是否显示
				},
				carPlaceInfo: {					
				},
				ckObj:[],//播放器对象用来控制播放器视频 比例
				styleObject:{
					width: "",
					position: "",
					left: ""
				},
				num: 0 , // 切换网格数
				monitorBtn:"开始监听",
				tokeBtn:"开始对讲",
				hostStream:{
					btn:"打开高清视频",
                    status: 1
				},
				seedStream:{
					btn:"打开标清视频",
                    status: 1
				},
				tStatus: 2,
				mStatus: 3,
				ip : "",
				treeBtnState: true,
				dialogVisible: false, // 切换宫格关闭多余视频弹窗
				time: new Date(), // 当前时间
				timerInterval: 30000, // 定时器工作时间 
				videoTimerData: "", // 视频定时器
				monitorTimerData: "", //监听定时器
				treeTimerData: "", //树定时器
				treeNewData: [], //树新数据
				talkBactData : {}, // 记录开启对讲 或者 监听车辆
				isUnfold: true,
				aisleParam: {}, // 批量播放通道视频参数
				isClickScreen: 0, // 是否为点击全屏进入全屏
				videoRatio: '2', // 视频比例
				ieH: "", // ie 9 10 下的高度
				smallVideoList: [], // 视频数组，存取ID
				closeVideoDom:[], // 记录关闭视频后的DIV
				videoObjIndex: 0, // 视屏渲染下标
				oldTreeData: "", // 旧的数据额构数据
				defaultGrid: '4', // 默认显示网格数
				initialWidth: '', // 记录全屏之前的宽
				initialHeight: '', // 记录全屏之前的高
				isFullScreen: false, // 是否全屏
				IsCarMenuShow: false, // 车辆右键菜单
				IsDepMenuShow:false, // 部门右键菜单
				IsAisleMenuShow: false, // 通道右侧菜单
				IsDepartmentShow:false, //部门右键菜单
				videoSetVisible: false, // 视频设置弹窗
				isIe: false,
				carId: '', // 选择的车辆ID
				carNum: '', // 选择的车辆编号
				textData: '',
				isBanTreeEvent:false,// 树结构定时器更新时禁止车辆通道右键事件
				cityName:"",
				imgsTypeVisible: false,
				filterText: '',
				treeData: [],
				defaultOpenNodes:[], 
				permBtn:{
	                monitor_play_all: false,
					monitor_stop_all: false, 
					monitor_edit_video_para: false, 
					monitor_play: false, 
					monitor_stop: false
				},
				videoSetDic: { // 视频设置参数字典
					auto_close_monitor_time: '',
					auto_close_video_time: '',
					video_maximum: '',
					stream_type: ''
				},
				videoSetData: { // 视频设置字典
					aggFlag: '',
					aggLevel: '',
					aggNum: '',
					alarmInterval: '',
					closeMonitor: '',
					closeVideo: '',
					gpsInterval: '',
					maxMonitor: '',
					parseMap: '',
					stream: ''
				},
				videoReadyData: { // 视频设置字典点击确认后生效
				    gpsInterval:'',
					closeMonitor: '',
					closeVideo: '',
					maxMonitor: '',
					stream: ''
				},
				videoData: [ // 视频格子
					{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}
				],
				// 自定义树的属性
				defaultProps: {
					children: 'children',
					label: 'name'
				},
				showTreeNodeId: [],
				treeLoad: false,//树loading状态
			}
		},
		computed: {
			videoClass() { // 网格class
				return this.defaultGrid == 1 ? 'video-one' : this.defaultGrid == 4 ?
					'video-four' : this.defaultGrid == 6 ? 'video-six' : this.defaultGrid == 9 ?
					'video-nine' : this.defaultGrid == 16 ? 'video-sixteen' : this.defaultGrid == 25 ?
				    'video-twenty-five' : 'video-thirty-six'					
			},
			isAllPlay() { // 控制全部播放暂停按钮
				const a = this.videoData.find(item => {
					if(item.hasOwnProperty('vid')) {
						return item.status == true;
					}
				})
				if(a) {
					return true
				} else {
					return false
				}
			},
			slidebar() { // 记录左侧导航状态
				return this.$store.getters.sidebar.opened
			},
			treeStyle(){ // 改变tree样式
				this.$nextTick(function(){
					this.treeData
				})
			}
		},
		watch: {
			filterText(val) {
				this.showTreeNodeId = [];
				this.$refs.tree2.filter(val);
			},
			defaultGrid(newVal, oldVal) { // 切换到6格时清浮动，不清布局会乱
				if(newVal == '6') {
					this.$nextTick(function() {
						let para = document.createElement('div');
						para.setAttribute('class', 'clearfix');
						// this.$refs.videos.children[2].after(para);
						$(this.$refs.videos.children[2]).after(para);
					})
				} else if(oldVal == '6') {
					const para = document.getElementsByClassName('clearfix')[0];
					this.$refs.videos.removeChild(para);
				}
			},
			slidebar(newVal, oldVal) { // 左侧导航切换重新加载视频
				if(!this.isUnfold){
                	if(!newVal){
						this.$nextTick(function() {
							this.styleObject.width = (document.body.offsetWidth - this.$refs.treeBox.offsetWidth - 30) + 'px';
							this.styleObject.left = (this.$refs.treeBox.offsetWidth + 65) + 'px'
						})
				    }else{
						this.$nextTick(function() {
							let left = (this.$refs.treeBox.offsetWidth + 185 + 10 );
							this.styleObject.position = "absolute";
							this.styleObject.width = (document.body.offsetWidth - this.$refs.treeBox.offsetWidth - 210 - 20) + 'px';
							this.styleObject.left = left + 'px';
						})
				    }
				}				
			},
			'videoData':{				
	            handler: function (newVal, oldVal){
					let vm = this;		
					let a =	vm.videoData.find(item =>{
						if(item.hasOwnProperty("vid")){
							return item.status;
						}
					})
					if(a){
						if(!vm.videoTimerData){
                            vm.videoTimer()
						}						
					}else{
						if(vm.videoTimerData){
							// console.log("清除视频定时器")
							vm.closeVideoDom = [];
							vm.videoObjIndex = 0;
							clearInterval(vm.videoTimerData)
							vm.videoTimerData = ""
						}
						clearInterval(vm.videoTimerData)
					}				   
				},
				deep: true
			},
			'talkBactData':{				
	            handler: function (newVal, oldVal){
					let vm = this;		
					if(vm.talkBactData.mStatus == "2" || vm.talkBactData.mStatus == "3"){
						if(!vm.monitorTimerData){
						    vm.monitorTimer();	
						}	                    				
					}else{						
						if(vm.monitorTimerData){
							// console.log("清除监听定时器")
							clearInterval(vm.monitorTimerData)
							vm.monitorTimerData = ""
						}
					}				   
				},
				deep: true
			},
			videoRatio (newVal, oldVal){
				if(newVal == "1"){
                    if(this.ckObj){
						this.ckObj.forEach(item =>{
							item.videoProportion(4,3)
						})
					}
				}else{
                    if(this.ckObj){
						this.ckObj.forEach(item =>{
							item.videoProportion(16,9)
						})
					}
				}
			}
		},
		mounted() {
			const vm = this;
			vm.$refs.tree2.oncontextmenu = function(){
			　　return false;
			}
			Array.prototype.each = function(fn, s = 2){                                                                                   
				if(this.length >0){                                                               
					for(var i = 0; i< this.length; i++ ) {
						var e = this[i];
						if(s == 3){
							if(e.type == 0){
								fn.call(e,e)
								if(e.children && e.children.constructor == Array){
                                    e.children.each(fn, s);      
								}							
							}
						}else{
							if(e.children && e.children.constructor == Array){                                                                                             
								e.children.each(fn, s);                                                       
							} else {
								if(e.hasOwnProperty('vid') && s != 2 && e.vid == s){
									fn.call(e,e);													
								} // && e.status == "1" ||  e.status == "2" || e.status == "3"
								if(e.hasOwnProperty('superVideo') && e.superVideo == "Y" && e.videoChannel != null  && e.status == "1" ||  e.status == "2" || e.status == "3" ){
									fn.call(e,e);  
								}                                                                                                          								                                                   
							}        
						}                                                                                   
						                                                                                                                    
					}                                                                                     					                                                                                       
				}                                                                             																								                                                                                                                                                    
			}  
			vm.getSetData();
		    vm.getPerm(); 
			vm.setHeight();
			vm.getDictionaries();                                        
			vm.initDepart();	
			vm.getVideoIp();
			window.onresize = function() { // 退出全屏触发
				if(vm.isClickScreen == 1) {
					if(!vm.checkFull()) {
						vm.exitFullscreen(); // 要执行的函数
                        vm.isClickScreen = 0;
					}
				} 
			};
			document.onkeyup = function (event) {//ie9  ie10 退出全屏
			if(vm.isIe){
				var e = event || window.event;
					var keyCode = e.keyCode || e.which;
					if(keyCode == 27){
						vm.exitFullscreen();
					}
				}
			}
		},
		beforeDestroy(){
			let vm = this;
			if(vm.videoTimerData){
				vm.videoTimerData = clearInterval(vm.videoTimerData); 
			}
			if(vm.monitorTimerData){
				vm.monitorTimerData = clearInterval(vm.monitorTimerData); 
			}
			if(vm.treeTimerData){
				vm.treeTimerData = clearInterval(vm.treeTimerData); 
			}
			if(vm.talkBactData.mStatus){
				if(vm.talkBactData.mStatus == 2){
                    vm.openTalkpack(0)
				}else if(vm.talkBactData.mStatus == 3){
                    vm.openMonitor(0)
				}
			}
			var videoArr = [];			
			if(vm.smallVideoList && vm.smallVideoList.length > 0) {							
				vm.videoData.forEach((item) => {
					if(item.hasOwnProperty("vid") && item.status == true){
						let vIndex = videoArr.findIndex(obj => {return obj.carId == item.carId})
						if(vIndex > -1){
							videoArr[vIndex].channels.push(parseInt(item.channels))
						}else{
							videoArr.push({
								carId: item.carId,
								channels: [parseInt(item.channels)],
							})
						} 						  
					}
				})													
			}
			let params = {
				data : JSON.stringify(videoArr)
			}
			if(videoArr.length > 0){
				vm.$instance.post("/proxy/monitor/video/batchStopVideo", params).then(res =>{
					if(res.status == 200){
						if (res.data.success) {

						} else {
							Message.error({message:res.data.errorMsg});						
						}
					}else{
						Message.error({message:"调用接口失败"});
					}
				}).catch(error => {Message.error({message:"调用接口失败！"});});	
			}		
		},
		methods: {
			//获取当前页面的权限
			getPerm(){
				this.permBtn = utils.permsButton(this);
			},
			// 打开组织机构弹框
			getCarId() {
				this.departData.dialog = true;
			},
			updateCity(a){
                this.cityName = a;
			},
			// 单个操作接口（播放视频，开启监听，开启对讲）
			promisePlayOne(param) {
				 let vm = this
				 return new Promise((resolve, reject) =>{
						vm.$instance.post("/proxy/monitor/video/playVideo", param).then((res) => {
						if(res.status == 200 ){
							if(res.data.success){
								resolve(res.data) ;
							}else{
								this.$message({
									message: res.data.errorMsg,
									type: 'warning',
									duration: '1500'
								})
								return false;
							}
						}else{
							this.$message({
								message: "调用接口失败",
								type: 'warning',
								duration: '1500'
							})
							return false;
						}
					})
				 })
			},
			// 单个停止接口 （关闭视频，关闭监听，关闭对讲）
			promiseStopOne(param) {
				 let vm = this
				 return new Promise((resolve, reject) =>{
					vm.$instance.post('/proxy/monitor/video/videoControl', param).then(res => {
						if(res.status == 200) {
							if(res.data.success) {
								resolve(res.data.success) 
							} else {							
								this.$message({
									message: res.data.errorMsg,
									type: 'warning',
									duration: '1500'
								})
								return false;
							}
						} else {
							this.$message({
								message: "调用接口失败",
								type: 'warning',
								duration: '1500'
							})
							return false;
						}
					})
				 })
			},
			// 关闭组织机构弹框
			closeDepart(param) {
				this.departData.dialog = false;
			},
			// 确定选择车辆
			getCar(nodes) {
				if(nodes.deptId) {
					this.carId = nodes.deptId; // 选中的车ID
					this.carNum = nodes.deptName; // 车牌号
					this.departData.dialog = false;
				}
			},
			// 获取视频Ip
			getVideoIp(){
				let vm = this;
	            vm.$instance.get("/proxy/config/findVideoServer").then((res) => {
					if(res.status == 200){
						if(res.data.ip && res.data.port){
							vm.ip =  res.data.ip +":"+ res.data.port                         	
						}						
					}
				})
			},
			// 子节点取消
			clearCar(param) {
				this.carId = ''; // 选中的车ID
				this.carNum = '';
			},
			nodeExpand(data, node, index) {
				this.defaultOpenNodes.push(data.id);
			},
			nodeCollapse(data, node, index) {
				var index = this.defaultOpenNodes.indexOf(data.id);
				if (index > -1) {
					this.defaultOpenNodes.splice(index, 1);
				}
			},
			// 树结构定时器
			treeTimer(){
				// console.log("树结构定时器")
				let vm = this;	
                this.treeTimerData = setInterval(() => {					
					vm.isBanTreeEvent = true;
					const params = {};	
					params.flags = true;	
					vm.treeLoad = true;	
					vm.$instance.get('/proxy/lbs/car/findCarTree', {
						param: params
					}).then(res => {
						if(res.status == 200) {
							vm.treeNewData = res.data.treeData;						 
							vm.treeNewData[0].children.each(function(a){
								a.children = [];
								a.videoChannel.split(",").forEach(function(item){
									let newChild = {
										id: item,
										type: 'td',
										divId:"",
										vid: a.carId + item,
										carId: a.carId,
										carStatus: a.status,
										status: false,
										carName: a.name,
										name: '通道' + (item),
									};								
									a.children.push(newChild)
								})
							})
							vm.oldTreeData = JSON.parse(JSON.stringify(vm.treeNewData)) 
							if(vm.talkBactData.vid){
								vm.treeNewData[0].children.each(function(a){
									if(a.carStatus == 1 || a.carStatus == 2 || a.carStatus == 3){
										a.mStatus = vm.talkBactData.mStatus;
										a.mTime = vm.talkBactData.mTime;
									}
								},vm.talkBactData.vid);
							}
                            vm.videoData.forEach(item =>{
								if(item.hasOwnProperty("vid")){
									vm.treeNewData[0].children.each(function(a){
										if(a.carStatus == 1 || a.carStatus == 2 || a.carStatus == 3){
											a.isM = item.isM;
											a.isT = item.isT;
											a.divId = item.divId;
											a.status = item.status;
											a.codeStream = item.codeStream;
											a.vTime =item.vTime;
										}else{
											a.channels = a.id											
											vm.playAndStopVideo(item,0)
										}
									},item.vid);
								}
							})
							vm.treeData = vm.treeNewData;	
							// console.log("更新树结构")
							vm.isBanTreeEvent = false;			
							//有过滤，触发过滤
							if (vm.filterText != "") {
								window.setTimeout(function() {
									vm.showTreeNodeId = [];
									vm.$refs.tree2.filter(vm.filterText);
								}, 1);
							}
							resolve(); // 异步操作成功
						} else {
							Message.error(res.data.errorMsg);
						}
						vm.treeLoad = false;
					}).catch(error => {vm.isBanTreeEvent = false;		vm.treeLoad = false;});
				}, parseInt(this.videoReadyData.gpsInterval || 30) * 1000)
			},
			//视频定时器
			videoTimer(){
                this.videoTimerData = setInterval(() => {
					// console.log("视频定时器")
					let vt = this.videoReadyData.closeVideo;
					if(vt == 0){
                        this.reporVideo() 
					}else{  
						this.reporVideo()  				
						this.videoData.forEach(item =>{	 			
							if(item.hasOwnProperty("vid")){
								// console.log(`关闭时间：${vt}`)
								if(item.status == true && (vt * 60 * 1000) <= (new Date().getTime()- item.vTime)) {
									// console.log("关闭视频")
								this.playAndStopVideo(item, 0)
							}
							}						
						});
					}				
				},this.timerInterval)
			},
			//监听对讲定时器
			monitorTimer(){
				let vm = this;
                vm.monitorTimerData = setInterval(() => {
					// console.log("监听定时器")
					let vt = vm.videoReadyData.closeMonitor;
					if(vt == 0){
						vm.reporVideo()
					}else{
	                    vm.reporVideo();					
						// console.log(`监听定时器关闭时间：${vt}`)
						if((vt * 60 * 1000) <= (new Date().getTime()- vm.talkBactData.mTime)) {
							if(vm.talkBactData.mStatus == 2){
								// console.log(`关闭对讲`)
                                vm.openTalkpack(0)
							}else if(vm.talkBactData.mStatus == 3){
								// console.log(`关闭监听`)
                                vm.openMonitor(0)
							}
						}
					}
				},this.timerInterval)
			},			
			// 获取默认参数 gpsInterval
			getSetData(){
				this.$instance.get("/proxy/sysmgr/account/findConfig").then((res) => {
					if(res.status == 200){
						let data = res.data;
						if(data){
	                        for( var i in this.videoReadyData){
								this.videoSetData[i] = data[i] == null ? "" : data[i].toString();
								this.videoReadyData[i] = data[i] == null ? "" : data[i].toString();
							}
							this.treeTimer()
						}
					}
				})
			},			
			//获取车辆位置
			getCarPlace(carId){
				let vm = this
				let param = {
				    carIds: [carId]
				};
				//vm.$instance.get("/proxy/lbs/car/findGpsByCarIds",{params: param} ).then((res) => {
				vm.$instance.post("/proxy/lbs/car/findGpsByCarIds",param).then((res) => {
					if(res.status == 200){
						if(res.data == "" || res.data.length == 0){
							vm.$refs.map.ready();
						    vm.cityName = "车辆位置不存在";
						}else{
							vm.carPlaceInfo = res.data[0];
							//未定位 不打点
							if(vm.carPlaceInfo.lbsFlag == '0'){
								Message.warning({message:"该车辆没有定位信息"});
							}else{
								this.$nextTick(function(){
									vm.$refs.map.monitorPlace(); 
								})
							}
						}
					}
				})
			},
			// 右键单击节点
			showMeau(event, data, value, node) {
				if(this.isBanTreeEvent){
                   return;
				}
				if(data.hasOwnProperty('superVideo') && data.type != 'td' && data.videoChannel != null && data.superVideo == "Y" &&  data.status != 0 && data.status != 4) {		
					this.$refs.carMenu.style.left = (event.clientX) + 'px';
					this.$refs.carMenu.style.top = (event.clientY - 80) + 'px';
					this.IsCarMenuShow = true;
					this.IsAisleMenuShow = false;
					const arr = [];
					let vm = this
					data.videoChannel.split(",").forEach(function(item){ // 过滤已经播放的视频
						if(vm.smallVideoList.indexOf(data.carId + item) == -1) {
							arr.push(item)
						}
					})
					data.num = arr;
					this.aisleParam = data;	
				}else if(data.type == 'td' && data.carStatus == 1 || data.carStatus == 2 || data.carStatus == 3 ){// 
					if(data.mStatus && data.mStatus != 0){
						if (data.mStatus == 3){
							this.monitorBtn = "关闭监听"
							this.tokeBtn = "开始对讲"
							this.mStatus = 0
							this.tStatus = 2
						}
						if(data.mStatus == 2) {
							this.monitorBtn = "开始监听"
							this.tokeBtn = "关闭对讲"
							this.mStatus = 3
							this.tStatus = 0
						}
					}else{
							this.monitorBtn = "开始监听"
							this.tokeBtn = "开始对讲"
							this.mStatus = 3
							this.tStatus = 2
						}
					if(data.status){
						if(data.codeStream == 0){
							this.hostStream.btn = "关闭高清视频";
							this.hostStream.status = 0;
							this.seedStream.btn = "打开标清视频";
							this.seedStream.status = 1;
						}else{
                            this.hostStream.btn = "打开高清视频";
							this.hostStream.status = 1;
							this.seedStream.btn = "关闭标清视频";
							this.seedStream.status = 0;
						}
					}else{
						this.hostStream.btn = "打开高清视频"
						this.seedStream.btn = "打开标清视频"
						this.hostStream.status = 1;
						this.seedStream.status = 1;
						}
					this.aisleParam = data;	
					this.$refs.aisleMenu.style.left = (event.clientX) + 'px';
					this.$refs.aisleMenu.style.top = (event.clientY - 100) + 'px';
					this.IsAisleMenuShow = true;
					this.IsCarMenuShow = false;
				}	
			},
			// 指定码流播放视频
			openVideoByStream(status, streamStatus){
				let vm = this
				vm.IsAisleMenuShow = false;		
				let  param, param1;
				if(streamStatus == 0){
					let obj = vm.videoData.find(item =>{
						return item.vid == vm.aisleParam.vid
					})
                    vm.playAndStopVideo(obj, 0) 
				}else{
					param = {
						carId:this.aisleParam.carId,
						channels: [vm.aisleParam.id],
						codeStream:status,
						dataType: 0
					};
					param1 = {
						carId: this.aisleParam.carId,
						channel: this.aisleParam.id,
						codeStream: status,
						controlCmd: '0',
						videoType: '0'
					};
					vm.aisleParam.codeStream = status;
					let treeChildData = vm.aisleParam;
					if(vm.smallVideoList.findIndex(item => {return item == vm.aisleParam.vid}) != -1){
                        this.videoObjIndex -=1
						this.closeVideoDom.push(vm.aisleParam.divId.substring(vm.aisleParam.divId.length - 1))
						vm.promiseStopOne(param1).then(res =>{
							if(res){
								vm.disposeStopData(vm.aisleParam)
								return vm.promisePlayOne(param)
							}
						}).then(res => {
							if(res){
								vm.disposePlayData(param, treeChildData, res)
							}
						})
					}else{
						vm.promisePlayOne(param,treeChildData).then(res => {
							if(res){
								vm.disposePlayData(param, treeChildData, res)
							}
						})
					}					
				}						
			},
			// 播放通道全部视频
			playAisleAllVideo() {
				const param = {
						carId: this.aisleParam.carId,
						channels: this.aisleParam.num,
						codeStream: this.videoReadyData.stream,
						dataType: 0
					};
				this.IsCarMenuShow = false;
				if(this.aisleParam.num.length > 0){
					if(this.aisleParam.num.length == this.defaultGrid - this.smallVideoList.length){

					}else if(this.smallVideoList.length  >= (this.defaultGrid -1) ) {
						this.$message({
							message: '视频格已占满，请切换。 或者关闭视频进行播放！',
							type: 'warning',
							duration: '1500'
						});
						return false;
					}
					this.promisePlayOne(param, this.aisleParam).then( res =>{
						if(res){
							this.disposePlayData(param, this.aisleParam, res)
						}
					})			
				}	
			},
			// 停止通道全部视频
			stopAisleAllVideo() {
				var videoArr = [{carId: this.aisleParam.carId , channels:[]}];				
				this.videoData.forEach((item) => {
					if(item.hasOwnProperty("vid") && item.carId == this.aisleParam.carId){
						if(item.status == true){
							videoArr[0].channels.push(parseInt(item.channels))
						}				  
					}
				})
				let params = {
					data : JSON.stringify(videoArr)
				}
				this.IsCarMenuShow = false;
				if(videoArr[0].channels.length > 0){
				let vm = this;
				vm.$instance.post("/proxy/monitor/video/batchStopVideo", params).then(res =>{
					if(res.status == 200){
						if (res.data.success) {												
							JSON.parse(params.data).forEach(item =>{
								vm.videoData.forEach((obj, index) => {
									if(item.carId == obj.carId){
										this.videoObjIndex -=1
										this.closeVideoDom.push(obj.divId.substring(obj.divId.length - 1))														
										$(obj.divId).find('div').remove();
										vm.$set(vm.videoData,index,{});
									    vm.smallVideoList.splice(vm.smallVideoList.indexOf(obj.vid),1);
									}
							    })
							})
							vm.aisleParam.children.forEach(item => {
                                item.status = false
							})
						} else {
							Message.error({message:res.data.errorMsg});						
						}
					}else{
						Message.error({message:"调用接口失败"});
					}
				}).catch(error => {Message.error({message:"调用接口失败！"});});					
				}				
			},
			// 开启关闭对讲
			openTalkpack(status) {
				let vm = this;
				if(status == 2){
					let params = {
						carId: this.aisleParam.carId,
						channels: [this.aisleParam.id],
						codeStream: '0',
						dataType: status
					}
					vm.promisePlayOne(params).then( res =>{
						if(res){
                            vm.IsAisleMenuShow = false;
							vm.syncTreeAndVideoData(status, false)		
						}
					})	   
				}else{
					let params = {
						carId: this.aisleParam.carId,
						channel: this.aisleParam.id,
						codeStream: '0',
						controlCmd: '4',
						videoType: '0'
					}
					vm.promiseStopOne(params).then( res =>{
						if(res){
                            vm.IsAisleMenuShow = false;
							vm.syncTreeAndVideoData(status, false)		
						}
					})		   
				}
			},
			// 开启关闭监听
			openMonitor(status, isM) {
				let vm = this;
				vm.IsAisleMenuShow = false;
				if(status == 3){
					let params = {
						carId: this.aisleParam.carId,
						channels: [this.aisleParam.id],
						codeStream: '0',
						dataType: status
					}
					vm.promisePlayOne(params).then( res =>{
						if(res){
                            vm.syncTreeAndVideoData(status, true)
						}
					})
				}else{
					let params = {
						carId: this.aisleParam.carId,
						channel: this.aisleParam.id,
						codeStream: '0',
						controlCmd: '0',
						videoType: '0'
					}
					vm.promiseStopOne(params).then( res =>{
						if(res){
                            vm.IsAisleMenuShow = false;
							vm.syncTreeAndVideoData(status, true)
						}
					})			   
				}
			},
			// 同步树结构和视频状态
			syncTreeAndVideoData(status,isM ){
				let vm = this
				let a = vm.talkBactData, b = vm.aisleParam;
					if(a.carId && b.vid != a.vid){
						a.mStatus = 0
					}
					vm.$set(b,'mStatus',status);
					vm.$set(b,'mTime', new Date().getTime());
					vm.talkBactData = b;
					if(isM && status == 3){
						let mIndex =  vm.videoData.findIndex(obj =>{
							if(obj.hasOwnProperty("vid")){
								return obj.vid == b.vid
							}
						})
						let tIndex =  vm.videoData.findIndex(obj =>{
							if(obj.hasOwnProperty("vid")){
								return obj.vid == a.vid
							}
						})
						if(mIndex > -1){
						vm.videoData[mIndex].isM = true;
						}
						if(tIndex > -1){
							vm.videoData[tIndex].isM = false;
						}		
					} else {
						if(vm.videoData.find(obj =>{
							return obj.vid == b.vid
						})){
							vm.videoData.find(obj =>{
								return obj.vid == b.vid
							}).isM = false;     
						}		
					}
										
			},		
			// 打开单个车辆通道
			openAisleOrGetVideo(treeChildData, value, node) {
				const vm = this;
				if(treeChildData.hasOwnProperty('superVideo') && treeChildData.type != 'td') {
					vm.getCarPlace(treeChildData.carId)
				} else if(treeChildData.type === 'td') {
					if(!this.treeBtnState){
						return false
					}				
					const param = {
						carId: treeChildData.carId,
						channels: [treeChildData.id || treeChildData],
						codeStream: vm.videoReadyData.stream,
						dataType: 0
					};
					if(vm.smallVideoList.indexOf(param.carId + param.channels) != -1) {
                        this.$message({
							message: '该通道已打开!',
							type: 'warning',
							duration: '1500'
						    });
						return false;
					}
					if(vm.smallVideoList.length >= vm.defaultGrid) {
						this.$message({
							message: '视频格已占满，请切换。 或者停止视频进行播放！',
							type: 'warning',
							duration: '1500'
						});
						return false;
					}
					this.treeBtnState = false;		
					vm.promisePlayOne(param, treeChildData).then( res => {
						this.treeBtnState = true
						if(res){
                            vm.disposePlayData(param, treeChildData, res)
						}						
					}) 					
				} 
			},			
			// 播放视频
			openVideo(data,vDom) {
				const vm = this;
				let id = ""
				data.forEach((item, index) => {
					if(vm.closeVideoDom[0]){
						vm.closeVideoDom.sort((a,b) => {
							return a-b
						})						
						id = "#videoPlayer" + vm.closeVideoDom[0]
						let i = vm.videoData.findIndex(item => {
							return !item.hasOwnProperty("vid")
						})
						this.videoObjIndex +=1
						vm.closeVideoDom.splice(0,1);
						vm.videoPlayer(item, id, i)
					}else{
						id = "#videoPlayer" + vm.videoObjIndex						
						vm.videoPlayer(item, id, vm.videoObjIndex)
						vm.videoObjIndex += 1;
					}
				})					
			},
			// 处理播放视频接口返回数据
            disposePlayData(param, treeChildData, res){
				let vm = this;
				let data = [];
				var a , b , c;
				if(treeChildData.hasOwnProperty("children")){
					c = treeChildData.name;
					treeChildData.children.forEach(item => {
						item.status = true
						item.codeStream = param.codeStream;
					})
				}else{
					c = treeChildData.carName;
					treeChildData.status = true;
					treeChildData.codeStream = param.codeStream;
				}
				param.channels.forEach(item =>{
					b = item
					// a = 'rtmp://47.104.139.220:1935/live/wang'
					a = `rtmp://${vm.ip}/live/${res.phone}-${item}`;
					console.log(a)
					data.push({
						carId : param.carId,
						name : c,
						channels : b,
						address : a,
						codeStream: param.codeStream
					})
				})						
				vm.openVideo(data)
			},
			// 处理停止视频接口返回数据
			disposeStopData(item){
				this.treeData[0].children.each(function(a){
					a.status = false;
				},item.vid);
				// this.videoObjIndex -= 1
				this.smallVideoList.splice(this.smallVideoList.indexOf(item.vid),1);
				var i = this.videoData.findIndex( obj => {return obj.vid == item.vid})
				this.$set(this.videoData,i,{});
				$(item.divId).find('div').remove();
			},

			// 初始化视频插件 ，videoData 新增修改数据
			videoPlayer(item, id, i) {
				let vm = this
				let idsubstr = id.substr(1,id.length-1)
				 item.vid = item.carId + item.channels;
						vm.smallVideoList.push(item.vid);
						var player = cyberplayer(idsubstr).setup({
							width: '100%',
							height: '100%',
							file: item.address, // <—rtmp直播地址
							autostart: true,
							stretching: "exactfit",
							volume: 100,
							controls: true,
							rtmp: {
								reconnecttime: 100000, // rtmp直播的重连次数
								bufferlength: 5 // 缓冲多少秒之后开始播放 默认1秒
							},
							ak: "xxxxxxxxxxxxxxxx" // 公有云平台注册即可获得accessKey
						});
						item.divId = id;
						vm.treeData[0].children.each(function(a){
							a.divId = item.divId;
						},item.vid);
						if(this.aisleParam.vid == item.vid){
							item.isM = vm.aisleParam.mStatus;
						}else{
							item.isM = false;
							item.isT = false;
						}
						item.status = true;
						item.vTime =  new Date().getTime();
						vm.videoData.splice(i, 1, item);
			},
			// 点击播放器 播放 || 停止视频(单个) 现在只有停止视频功能
			playAndStopVideo(item, status, e) {
				let vm = this;
				if(!item.vid){
					this.$message({
							message: '没有视频在播放！',
							type: 'warning',
							duration: '1500'
						});
					return;
				}
				if(status == 3){
				} else {
					this.videoObjIndex -=1
					this.closeVideoDom.push(item.divId.substring(item.divId.length - 1))
					const params = {
						carId: item.carId,
						channel: item.channels || item.id,
						codeStream:item.codeStream || "1",
						controlCmd: status ,
						videoType: 0
					}
					this.promiseStopOne(params).then( res => {
						if(res){
							this.disposeStopData(item)
						}
					})
				}
			},
			// 播放 || 停止视频(全部)
			playAllAndStop() {
				let vm = this
				vm.closeVideoDom = [];
				if(vm.smallVideoList.length > 0) {
					var videoArr = [];				
					vm.videoData.forEach((item) => {
						if(item.hasOwnProperty("vid") && item.status == vm.isAllPlay){
							vm.treeData[0].children.each(function(a){
									a.status = !item.status;
								},item.vid);
							let vIndex = videoArr.findIndex(obj => {return obj.carId == item.carId})
							if(vIndex > -1){  
                                videoArr[vIndex].channels.push(parseInt(item.channels))
							}else{
								videoArr.push({
									carId: item.carId,
									channels: [parseInt(item.channels)],
								})
							} 						  
						}
					})									
					let params = {
						data : JSON.stringify(videoArr)
					}
					if(vm.isAllPlay){
						vm.clearCarVideo()
					}else{
						vm.clearCarVideo()
					}
				} else {
					this.$message({
						message: '没有视频在播放！',
						type: 'warning',
						duration: '1500'
					});
				}
			},
			// 批量播放视频接口 暂时不用
			batchPlayVideo(params){
				let vm = this;
				vm.$instance.post("/proxy/monitor/video/batchPlayVideo", params).then(res =>{
					if(res.status == 200){
						if (res.data.success) {
							vm.videoData.forEach((obj) => {
								obj.status = true
							})
						} else {
							Message.error({message:res.data.errorMsg});						
						}
					    return;
					}else{
						Message.error({message:"调用接口失败"});
					}
				}).catch(error => {Message.error({message:"调用接口失败！"});});
			},
		    // 清除所有视频
			clearCarVideo(){
				let vm = this;
				if(vm.smallVideoList && vm.smallVideoList.length > 0) {
					vm.videoObjIndex = 0;
					vm.treeData =JSON.parse(JSON.stringify(vm.oldTreeData));
					vm.ckObj = [];
					var videoArr = [];				
					vm.videoData.forEach((item) => {
						if(item.hasOwnProperty("vid") && item.status == true){
							let vIndex = videoArr.findIndex(obj => {return obj.carId == item.carId})
							if(vIndex > -1){
                                videoArr[vIndex].channels.push(parseInt(item.channels))
							}else{
								videoArr.push({
									carId: item.carId,
									channels: [parseInt(item.channels)],
								})
							} 						  
						}
					})
					let params = {
					    data : JSON.stringify(videoArr)
					}
					if(videoArr.length > 0){
						vm.$instance.post("/proxy/monitor/video/batchStopVideo", params).then(res =>{
							if(res.status == 200){
								if (res.data.success) {
									vm.smallVideoList = [];
									vm.talkBactData = {};
									vm.aisleParam = {};
									vm.videoObjIndex = 0
									vm.videoData = [{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}];
									$(vm.$refs.videos).find('object').remove()
									$(vm.$refs.videos).find(".jw-title-primary").remove();
									this.$message({
										message: '关闭成功',
										type: 'success',
										duration: '1500'
									});
								} else {
									Message.error({message:res.data.errorMsg});						
								}
							}else{
								Message.error({message:"调用接口失败"});
							}
						})
					}else{
						vm.smallVideoList = [];
						vm.talkBactData = {};
						vm.aisleParam = {};
						vm.videoObjIndex = 0
						vm.videoData = [{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}];
						$(vm.$refs.videos).find('object').remove()
						$(vm.$refs.videos).find(".jw-title-primary").remove();
					}													
				} 
			},
			//视频心跳
			reporVideo(){
				let vm = this;
				let videoArr = [];
				vm.videoData.forEach((item) => {
						if(item.hasOwnProperty("vid") && item.status || item.isM || item.isT){
							let vIndex = videoArr.findIndex(obj => {return obj.carId == item.carId})
							if(vIndex > -1){
                                videoArr[vIndex].channels.push(parseInt(item.channels))
							}else{
							videoArr.push({
								carId: item.carId,
								channels: [parseInt(item.channels)],
							})
						} 						  
					}
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
				}).catch(error => {Message.error({message:"调用接口失败！"});});
			},
			//修改视频参数设置
			handleEditSubmit(){
				let param = this.videoSetData;
				this.$instance.post("/proxy/sysmgr/account/editConfig", param).then((res) => {
					if(res.status == 200 && res.data.success){
						this.$message({
								message: '设置成功',
								type: 'success',
								duration: '1500'
							});	
						for(var i in this.videoReadyData) {
							this.videoReadyData[i] = this.videoSetData[i]							
						}
						// this.defaultGrid = this.videoSetData['maxMonitor']
						// if(this.videoReadyData.maxMonitor < this.defaultGrid){
						// 	this.defaultGrid = this.videoReadyData.maxMonitor
						// }
					}
				})
				this.videoSetVisible = false;
			},
			// 打开全屏
			openFullscreen() {
				this.initialWidth = this.$refs.videos.style.width;
				this.initialHeight = this.$refs.videos.style.height;
				this.isFullScreen = true;
				let windowWidth = window.screen.width - 4;
				this.$refs.videos.style.height = (window.screen.height - 4) + 'px';
				this.launchFullscreen(this.$refs.videos);
				this.isClickScreen = 1
			},
			// 改变视频网格弹窗
			editVideoGrid(num) {
				if(this.videoObjIndex && this.smallVideoList.length > num){
                    this.num = num;
				    this.dialogVisible = true;
				}else{
					this.num = num;
					this.defaultGrid = this.num;
					this.handleClosevideos()
				}
			},
			// 改变视频网格删除多余视频
			handleClosevideos(){
				let vm = this;
				vm.defaultGrid = vm.num;
				var videoArr = [];	
				let i = 0
				if(vm.smallVideoList.length > 0){
					vm.videoData.forEach((item, index) => {
						if(item.hasOwnProperty('carId')) {
							if(i >= vm.num) {
								let vIndex = videoArr.findIndex(obj => {return obj.carId == item.carId})
								if(vIndex > -1){
									vm.videoObjIndex -= 1;
									videoArr[vIndex].channels.push(parseInt(item.channels))
								}else{
									vm.videoObjIndex -= 1;
									videoArr.push({
										carId: item.carId,
										channels: [parseInt(item.channels)],
									})
								} 
								vm.videoData[index] = ''
								vm.smallVideoList.splice(vm.smallVideoList.indexOf(item.vid), 1);
								vm.treeData[0].children.each(function(a){
									a.status = false;
								},item.vid);
							}else{
								if(vm.smallVideoList.length > 0){									
									if(i != index){							
									let a = vm.videoData[index]
									// let b = vm.closeVideoDom.length
									// let closeIndex = vm.closeVideoDom.indexOf(""+ i);								
									// if (closeIndex > -1) {
										// vm.videoObjIndex -= b
										vm.closeVideoDom = [];
									// 	vm.closeVideoDom = [];								
									// }
									$(a.divId).find('div').remove();
									a.divId = "#videoPlayer" + i;
									vm.videoData[i] = a
									vm.videoData[index] = ''
										let idsubstr = vm.videoData[i].divId.substr(1,vm.videoData[i].divId.length-1)
										var player = cyberplayer(idsubstr).setup({
										width: '100%',
										height: '100%',
										file:  vm.videoData[i].address, // <—rtmp直播地址
										autostart: true,
										stretching: "exactfit",
										volume: 100,
										controls: true,
										rtmp: {
											reconnecttime: 100000, // rtmp直播的重连次数
											bufferlength: 5 // 缓冲多少秒之后开始播放 默认1秒
										},
										ak: "xxxxxxxxxxxxxxxx" // 公有云平台注册即可获得accessKey
									});
									}
								}
							}
							i++
						}
					})
					let params = {
						data : JSON.stringify(videoArr)
					}
					if(videoArr.length > 0){
	                    vm.$instance.post("/proxy/monitor/video/batchStopVideo", params).then(res =>{
							if(res.status == 200){
								if (res.data.success) {									
								} else {
									Message.error({message:res.data.errorMsg});						
								}
							}else{
								Message.error({message:"调用接口失败"});
							}
						}).catch(error => {Message.error({message:"调用接口失败！"});});
					}
				// 	vm.videoData.forEach((item, index) => {
				// 		if(item.hasOwnProperty('carId')) {
				// 			if(index >= vm.num) {
				// 				let vIndex = videoArr.findIndex(obj => {return obj.carId == item.carId})
				// 				if(vIndex > -1){
				// 					videoArr[vIndex].channels.push(parseInt(item.channels))
				// 				}else{
				// 					videoArr.push({
				// 						carId: item.carId,
				// 						channels: [parseInt(item.channels)],
				// 					})
				// 				} 
				// 				vm.videoData[index] = ''
				// 				vm.smallVideoList.splice(vm.smallVideoList.indexOf(item.vid), 1);
				// 				vm.treeData[0].children.each(function(a){
				// 					a.status = false;
				// 				},item.vid);
				// 				vm.videoObjIndex -= 1;
				// 			}
				// 		}
				// 	})
				// 	let params = {
				// 		data : JSON.stringify(videoArr)
				// 	}
				// 	if(videoArr.length > 0){
	            //         vm.$instance.post("/proxy/monitor/video/batchStopVideo", params).then(res =>{
				// 			if(res.status == 200){
				// 				if (res.data.success) {									
				// 				} else {
				// 					Message.error({message:res.data.errorMsg});						
				// 				}
				// 			}else{
				// 				Message.error({message:"调用接口失败"});
				// 			}
				// 		}).catch(error => {Message.error({message:"调用接口失败！"});});
				// 	}
				}
				this.dialogVisible = false;
			},
			// 抓拍
			photograph() {
				this.IsAisleMenuShow = false;
				let param = {
					carId: this.aisleParam.carId,
					channel: this.aisleParam.id
				}
			    this.$instance.get("/proxy/monitor/video/shotPhoto", {params: param}).then(res =>{
					if(res.status == 200){
						if (res.data.success) {		
							this.$message({
								message: '抓拍成功',
								type: 'success',
								duration: '1500'
							});					
						} else {
							Message.error({message:res.data.errorMsg});						
						}
					}else{
						Message.error({message:"调用接口失败"});
					}
				}).catch(error => {Message.error({message:"调用接口失败！"});});
			},
			//展开地图
			unfoldMap(){
				if(this.isUnfold){
					if(this.slidebar){
						let left = (this.$refs.treeBox.offsetWidth + 200 +30);
						this.styleObject.position = "absolute";
						this.styleObject.width = (document.body.offsetWidth - this.$refs.treeBox.offsetWidth - 210 -20) + 'px';;
						this.styleObject.left = left + 'px';
					} else{
						this.styleObject.position = "absolute";
						this.styleObject.width = (document.body.offsetWidth - this.$refs.treeBox.offsetWidth - 30) + 'px';
					    this.styleObject.left = (this.$refs.treeBox.offsetWidth + 30) + 'px'
					}
					this.isUnfold = false
				}else{
					this.styleObject.position = "";
					this.styleObject.width = "";
					this.styleObject.left ="";				
					this.isUnfold = true;
				}
			},
			// 获取组织机构树
			initDepart() {
				const params = {};
				const vm = this;
				vm.treeLoad = true;
				vm.$instance.get('/proxy/lbs/car/findCarTree', {
					param: params
				}).then(res => {
					if(res.status == 200) {
						vm.treeData = res.data.treeData;
						vm.defaultOpenNodes = [];
						vm.defaultOpenNodes.push(vm.treeData[0].id);
						vm.treeData[0].children.each(function(a){
							a.children = [];
							a.videoChannel.split(",").forEach(function(item){
	                            let newChild = {
									id: item, // 通道号	
									type: 'td', // TYPE
									divId:"", // 对应元素ID
									vid: a.carId + item, // 唯一ID 
									carId: a.carId, // 车ID
									carStatus: a.status, // 车状态
									status: false, // 通道状态
 									carName: a.name, // 车辆名称
									name: '通道' + (item), // 通道名
								};								
							    a.children.push(newChild)
							})
						})
						vm.oldTreeData = JSON.parse(JSON.stringify(vm.treeData)) 
						resolve(); // 异步操作成功
					} else {
						Message.error(res.data.errorMsg);
					}
					vm.treeLoad = false;
				}).catch(error => {vm.treeLoad = false;});
			},
			// 获取字典参数
			getDictionaries() {
				const arr = ['auto_close_monitor_time', 'auto_close_video_time', 'video_maximum', 'stream_type'];
				utils.batchDictsByCode(arr, data => {				
					this.videoSetDic = data;
				    for (const key in this.videoSetDic) {
                        this.videoSetDic[key].forEach(item =>{
                            item.dictCode = item.dictCode.split("_")[1]
                        })      
                     } 
				})
			},
			// 页面加载设置高度
			setHeight() {
				const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight; // 浏览器高度
				this.$refs.treeBox.style.height = windowHeight - 85 + 'px';
				this.$nextTick(function(){
                    this.$refs.treeBox.children[2].style.height = (windowHeight - 85 - 120)+ 'px';
				})				
				this.$refs.mapCon.style.height = windowHeight - 85 + 'px';
				this.$refs.videoCon.style.height = windowHeight - 85 + 'px';
				this.$refs.videos.style.height = windowHeight - 45 - 85 + 'px';
				let height = this.$refs.treeBox.offsetHeight; // 100
				this.$refs.elTree.style.height = height - 85 + 'px';
				const h = $('.sidebar-wrapper').height(); // 左侧路由高度
				height = h - 35;
				document.getElementById('allmap').style.height = (height - 35) + 'px';
			},
			tipImgsShow() {
				this.imgsTypeVisible = true;
			},
			tipImgsHide() {
				this.imgsTypeVisible = false;
			},
			// 搜索树
			filterNode(value, data) {
				if(!value) return true;
				if( data.type == "td"  && this.showTreeNodeId.indexOf(data.carId)!== -1) {			
					return true;
				}
				if( data.type != "td" ){
					let show = data.name.indexOf(value) !== -1;
					let parentShow = this.showTreeNodeId.indexOf(data.pId) !== -1
					// console.log(data.label, show, parentShow, this.showTreeNodeId);
					if(show || parentShow) {
						this.showTreeNodeId.push(data.id);
					}
					return show || parentShow;
				}								
			},
			// 树回调
			renderContent(h, {node, data ,store}) {
				let checkVideoClassStr = "icon-c-dot"
				let videoClassStr = 'icon-c-shipin'
				if(data.type == 1) {
					// 0：离线 1：在线 2：怠速 3：告警 4：未激活
					let classStr = 'car-img caronline';
					switch(data.status) {
						case 0:
							{
								classStr = 'car-img caroutline';
							}
							break;
						case 1:
							{
								classStr = 'car-img caronline';
							}
							break;
						case 2:
							{
								classStr = 'car-img carstop';
							}
							break;
						case 3:
							{
								classStr = 'car-img cartip';
							}
							break;
						case 4:
							{
								classStr = 'car-img carnoactive';
							}
							break;
						default:
							break;
					}				
					return(
						<span class="custom-tree-node">
							<span class={classStr}></span>
							<span class="strongTree2" title={data.name}>{data.name} </span>
						</span>
					);
				} else if(data.type == "td"){
					let mClassStr = '';
					if(data.hasOwnProperty('mStatus')){
                        // 2 开启对讲 3 开启监听
                        switch(data.mStatus) {
						case 2:
							{
								mClassStr = 'icon-c-msnui-mic-inverse';
							}
							break;
						case 3:
							{
								mClassStr = 'icon-c-erji';
							}
							break;
						default:
							break;
					    }
					}	
					if(!data.status){
                    return(
						<span class="custom-tree-node car-td">
						<span class={videoClassStr}>&nbsp;</span>
							<span class="strongTree2" title={data.name}>{data.name} </span>
                            <span class={mClassStr}></span>
						</span>
					);
					} else{
						 return(
						<span class="custom-tree-node car-td">
						<span class={videoClassStr}> &nbsp;</span>							
							<span class="strongTree2" title={data.name}>{data.name} </span>
							<span class={checkVideoClassStr}> </span>
						    <span class={mClassStr}></span>
						</span>
						 )
					}
				}
				 else {
					return(
						<span class="custom-tree-node">
							<span class="strongTree2" title={data.name}>{data.name} </span>
						</span>
					);
				}
			},
			// 判断是否全屏
			checkFull() {
				if( document.msFullscreenEnabled){
					this.isIe = true
				};
				let isFull = document.fullscreenEnabled || window.fullScreen || document.webkitIsFullScreen || document.msFullscreenEnabled;
				// to fix : false || undefined == undefined
				if(isFull === undefined) isFull = false;
				return isFull;
			},
			// 全屏
			launchFullscreen(element) {
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
					this.ieH = height;
					this.$refs.videos.style.position = 'absolute';
					this.$refs.videos.style.zIndex = '5000';
					this.$refs.videos.style.left = 0;
					this.$refs.videos.style.top = '-70px'
					this.$refs.videos.style.width = '100%';
					this.$refs.videos.style.height = height + 80 +'px';					
					document.IsFullScreen = true;
				}
			},
			// 退出全屏
			exitFullscreen() {
				this.$refs.videos.style.height = this.initialHeight;
				this.$refs.videos.style.width = this.initialWidth;
				if(document.exitFullscreen) {
					document.exitFullscreen();
				} else if(document.msExitFullscreen) {
					document.msExitFullscreen();
						this.isIe = false;
				} else if(document.mozCancelFullScreen) {
					document.mozCancelFullScreen();
				} else if(document.oRequestFullscreen) {
					document.oCancelFullScreen();
				} else if(document.webkitExitFullscreen) {
					document.webkitExitFullscreen();
				} else {
					this.isIe = false;
					this.ieH = "";
					this.$refs.videos.style.position = 'relative';
					this.$refs.videos.style.zIndex = '0';
					this.$refs.videos.style.top = 0;
					document.IsFullScreen = false;
				}
			}
		}
	}
</script>
<style rel="stylesheet/scss" scoped lang="scss">
html{
	font-size: 62.5%
}
	$width:66.6%;
	.app-container{
		background: #E9ECF3;
		padding: 0;
	}
	.container {
		&.container1 {
			margin: 70px 10px 10px 20px;
		}
		.tree-box {
			position: relative;
			width: 16.7%
		}
		.video-container {
			width: 56%;
			margin-left: 0.8%;
			.operation {
				height: 45px;
				background: #ffffff;
				width: 100%;
				font-size: 0;
				&>i {
					vertical-align: middle;
					line-height: 45px;
					cursor: pointer;
					font-size: 24px;
					color: #d5d5d5;
					&.icon-c-one {
						font-size: 34px;
					}
					&.icon-c-four {
						font-size: 28px;
					}
					&:first-child {
						margin-left: 10px;
					}
					&.icon-c-six {
						margin-left: 6px;
					}
					&.icon-blue {
						color: #566fc9!important;
					}
					&.icon-c-nine {
						margin-left: 8px;
					}
					&.icon-c-sixteen {
						font-size: 25px;
						margin-left: 8px;
						display: inline-block;
						margin-top: 2px;
					}
					&.icon-c-twenty-five {
						font-size: 20px;
						margin-left: 8px;
						display: inline-block;
					}
					&.icon-c-thirty-six{
						font-size: 20px;
						margin-left: 8px;
						display: inline-block;
					}
					&.video-ope {
						color: black;
						margin-left: 14px;
					}
				}
				.select {
					vertical-align: middle;
					margin-left: 9px;
				}
				.el-input {
					width: 105px;
				}
				.btn-clear {
					vertical-align: middle;
					margin-left: 15px;
				}
			}
			.video-box {
				font-size: 0;
				width: 100%;
				position: relative;
				background: black;
				.video-player-box{
                    border-right: 1px solid #ccc;
				}
				.video-bg{
					width: 40%;
					height: 50%;
					position: absolute;
					left: 30%;
					top: 25%;
				}		
				&.clearfix {
					clear: both;
				}
				.video-one {
					position: relative;
					width: 100%;
					height: 100%;
					font-size: 16px !important;					
				}
				.video-four {
					position: relative;
					float: left;
					width: 50%;
					height: 50%;
					font-size: 16px !important;
				}
				.video-nine {
					position: relative;
					float: left;
					width: 33.3333%;
					height: 33.3333%;
					font-size: 16px !important;
				}
				.video-sixteen {
					position: relative;
					float: left;
					width: 25%;
					height: 25%;
					font-size: 14px !important;
				}
				.video-twenty-five {
					position: relative;
					float: left;
					width: 20%;
					height: 20%;
					font-size: 12px !important;
				}
				.video-thirty-six {
					position: relative;
					float: left;
					width: 16.666%;
					height: 16.666%;
				}
				.video-six {
					position: relative;
					float: left;
					width: 33.3333%;
					height: 33.3333%;
					font-size: 16px !important;
					&:first-child {
						font-size: 16px !important;
						width: 66.6666%;
						height: 66.6666%;
					}
				}
				& .video-player {
					width: 100%;
					height: 100%;
                    text-align: center;
				}
				& .video-control {
					border-bottom: 1px solid #ccc;
					position: absolute;
					bottom: 0;
					width: 100%;
					height: 40px;
					background: #444;
					opacity: 0.9;
					p {
						display: inline-block;
						
						height: 40px;
						line-height: 40px;
						// font-size: 16px;
						color: white;
						&.video-text {
							// font-size: 16px;
							float: right;
							width: 74%;
						}
						&.video-icon {
							width: 25%;
							padding-left: 5%;
							cursor: pointer;
							text-align: left;
							i {
								font-size: 20px;
								margin-right: 3%;
								&:last-child{
									margin-right: 8%;
								}
							}
						}
					}
				}
				.el-icon-close {
					position: absolute;
					right: 2%;
					top: 2%;
					color: #fff;
					cursor: pointer;
					&:hover {
						color: #566fc9
					}
				}
			}
		}
		.mapCon {
			width: 25.7%;
			p{
			    height:45px;
				line-height:45px;	
				i{
					cursor: pointer;
					color: #fff;
					font-size: 24px;
					border-radius: 10%;
					background: #566fc9;
					vertical-align: middle;
					height: 49px;
					line-height: 49px;
				}			
			}
		}
		.mapCon1{
			position: absolute;
		}
		.confirm{
			i{
				display: inline-block;
				vertical-align: middle;
			}
			span{
				display: inline-block;
			}
		}
		.tree-list{
			margin-top: 10px;
		}
		.tree-list-td{
			margin-top: 10px;

		}
		.menu {
			position: absolute;
			cursor: pointer;
			z-index: 1000;
			background: #fff;
			width: 120px;
			border: 1px solid #dcdfe6;
			border-bottom: none;
			p {
				height: 30px;
				line-height: 30px;
				font-size: 14px;
				text-align: center;
				border-bottom: 1px solid #dcdfe6;
				&:hover{
					background: #f7f7f7;
				}
			}
		}
	}
	.gpsInterval{
		position: absolute;
		bottom: 10px;
		width: 100%;
		margin-top: 50px;
        padding-top:10px;
		color:#85b3e0;
		border-top:1px solid #F5F5F5;
		text-align:center;
		font-size: 13px;
	}
.car-td{
	padding-left: 25px;
}

</style>