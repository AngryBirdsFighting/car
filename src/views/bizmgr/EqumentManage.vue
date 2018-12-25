/** * @Author: wangchao 
 * * @DateTime: 2018-02-27 
 * @Description: 设备管理组件
*/
<template>
	<div class="app-container" v-loading="listAllLoading" element-loading-text="正在从设置上获取信息，请稍后...">
		<!-- 搜索条件 -->
		<div class="filter-container">
			<el-form :inline="true" :model="listQuery" class="demo-form-inline">
				<el-form-item label="IEMI号">
					<el-input v-model="listQuery.equImei" placeholder="请输入IEMI号" clearable></el-input>
				</el-form-item>
				<el-form-item label="手机号">
					<el-input v-model="listQuery.phone" placeholder="请输入手机号" clearable></el-input>
				</el-form-item>
				<el-form-item label="组织机构">
					<depart_select @deptIdChange="deptCurrentChange"></depart_select>
				</el-form-item>
				<el-form-item label="设备型号">
					<el-select v-model="listQuery.modelId" clearable placeholder="请选择设备型号">
						<el-option label="请选择" value=""></el-option>
						<el-option
						v-for="item in modelList"
						:key="item.modelId"
						:label="item.modelName"
						:value="item.modelId">
						</el-option>
					</el-select>					 
				</el-form-item>
				<el-form-item label="绑定状态">
					<el-select v-model="listQuery.isbind" clearable placeholder="请选择状态">
						<el-option label="已绑定" value="true"></el-option>
						<el-option label="未绑定" value="false"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button class="filter-item btnColor" type="primary" icon="el-icon-search" @click="getList(true)">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button v-if="permBtn.equment_add" class="filter-item btnColor" type="primary" icon="el-icon-plus" @click="handleCreate">新增</el-button>
				</el-form-item>
				<el-form-item>
					<el-button v-if="permBtn.equment_export" class="filter-item btnColor" type="primary" icon="el-icon-download" @click="exportFormLists">导出</el-button>
				</el-form-item>
			</el-form>
		</div>
			
		<!-- 表格 -->
		<el-table ref="multipleTable" :data="list" :height="height" fit highlight-current-row v-loading="listLoading" element-loading-text="拼命加载中">
			<el-table-column align="center" label="组织机构" prop="deptName"></el-table-column>
			<el-table-column align="center" label='IEMI号' prop="equImei"></el-table-column>
			<el-table-column align="center" label="手机号" prop="phone"></el-table-column>
			<el-table-column align="center" label="设备型号" prop="modelName"></el-table-column>
			<el-table-column align="center" label="协议类型" prop="protocolType"></el-table-column>
		    <el-table-column align="center" label="视频功能" >
				<template slot-scope="scope">
					<!-- allowMobile 	Y:允许N:不允许-->
					<div v-if="scope.row.superVideo == 'Y'">支持</div>
					<div v-else>不支持</div>
				</template>
			</el-table-column>
			<el-table-column align="center" label="视频通道">
				<template slot-scope="scope">
					<div v-if="scope.row.videoChannel != null">{{scope.row.videoChannel}}</div>
					<div v-else>暂无通道</div> 
				</template>
			</el-table-column>
			<el-table-column align="center" label="绑定状态">
				<template slot-scope="scope">
					<!-- allowMobile 	Y:允许N:不允许-->
					<div v-if="scope.row.isbind">已绑定</div>
					<div v-else>未绑定</div>
				</template></el-table-column>	
			<el-table-column align="center" label="操作">
				<template slot-scope="scope">
					<el-button v-if="permBtn.equment_check" class="btn check" size="small" @click="check(scope.$index, scope.row)" title="查看"></el-button>
					<el-button v-if="permBtn.equment_Modify" class="btn update" size="small" @click="handleEdit(scope.$index, scope.row)" title="修改"></el-button>
					<el-button v-if="permBtn.equment_delete" class="btn delete" size="small" @click="handleDelete(scope.$index, scope.row)" title="删除"></el-button>
				</template>
			</el-table-column>
		</el-table>
		
		<!-- 分页 -->
		<pagination ref="page" :total="total" @reLoadData="paginationChange"></pagination>
		
		<!--查看-->
		<el-dialog title="设备信息" :visible.sync="checkFormVisible" top="10%" width="881px" lock-scroll class="editBox terminal-info" :close-on-click-modal="false">
			<el-form class="small-space" :model="editParamsTemp" label-position="left" label-width="120px">
				<div class="equ-tab">
					<el-button @click="tabShow(0)" :class="tabindex || 'tab-active'">基本信息</el-button>
					<el-button v-if="videoIfon" @click="tabShow(1)" :class="tabindex && 'tab-active' ">视频信息</el-button>
				</div>
				<table v-if="isTableShow" width="100%" cellspacing="0" cellpadding="0">
					<tr>
						<td>终端类型</td>
						<td>
							<template v-if="editParamsTemp.terminalType">
								<el-tooltip class="item" effect="dark" :content="editParamsTemp.terminalType" placement="bottom">
							      	<el-button>{{editParamsTemp.terminalType}}</el-button>
							    </el-tooltip>
							</template>
						</td>
						<td>制造商ID</td>
						<td>
							<template v-if="editParamsTemp.manufactureId">
								<el-tooltip class="item" effect="dark" :content="editParamsTemp.manufactureId" placement="bottom">
							      	<el-button>{{editParamsTemp.manufactureId}}</el-button>
							    </el-tooltip>
							</template>
						</td>
						<td>终端型号</td>
						<td>
							<template v-if="editParamsTemp.terminalModelNo">
								<el-tooltip class="item" effect="dark" :content="editParamsTemp.terminalModelNo" placement="bottom">
							      	<el-button>{{editParamsTemp.terminalModelNo}}</el-button>
							    </el-tooltip>
							</template>
						</td>
					</tr>
					<tr>
						<td>终端ID</td>
						<td>
							<template v-if="editParamsTemp.terminalId">
								<el-tooltip class="item" effect="dark" :content="editParamsTemp.terminalId" placement="bottom">
							      	<el-button>{{editParamsTemp.terminalId}}</el-button>
							    </el-tooltip>
							</template>
						</td>
						<td>终端SIM卡ICCID</td>
						<td>
							<template v-if="editParamsTemp.terminalSimCard">
								<el-tooltip class="item" effect="dark" :content="editParamsTemp.terminalSimCard" placement="bottom">
							      	<el-button>{{editParamsTemp.terminalSimCard}}</el-button>
							    </el-tooltip>
							</template>
						</td>
						<td>终端硬件版本号</td>
						<td>
							<template v-if="editParamsTemp.terminalVersion">
								<el-tooltip class="item" effect="dark" :content="editParamsTemp.terminalVersion" placement="bottom">
							      	<el-button>{{editParamsTemp.terminalVersion}}</el-button>
							    </el-tooltip>
							</template>
						</td>
					</tr>
					<tr>
						<td>终端固件版本号</td>
						<td>
							<template v-if="editParamsTemp.terminalFirmwareVersion">
								<el-tooltip class="item" effect="dark" :content="editParamsTemp.terminalFirmwareVersion" placement="bottom">
							      	<el-button>{{editParamsTemp.terminalFirmwareVersion}}</el-button>
							    </el-tooltip>
							</template>
						</td>
						<td>终端心跳</td>
						<td>
							<template v-if="editParamsTemp.paramObj['0001']">
								{{editParamsTemp.paramObj['0001']}}(s)
							</template>
						</td>
						<td>主服务器IP</td>
						<td>
							<template v-if="editParamsTemp.paramObj['0013']">
								{{editParamsTemp.paramObj['0013']}}
							</template>
						</td>
					</tr>
					<tr>
						<td>备份服务器IP</td>
						<td>
							<template v-if="editParamsTemp.paramObj['0017']">
								{{editParamsTemp.paramObj['0017']}}
							</template>
						</td>
						<td>服务器TCP端口</td>
						<td>
							<template v-if="editParamsTemp.paramObj['0018']">
								{{editParamsTemp.paramObj['0018']}}
							</template>
						</td>
						<td>服务器UDP端口</td>
						<td>
							<template v-if="editParamsTemp.paramObj['0019']">
								{{editParamsTemp.paramObj['0019']}}
							</template>
						</td>
					</tr>
					<tr>
						<td>位置汇报策略</td>
						<td>
							<template v-if="editParamsTemp.paramObj['0020']">
								<div v-if="editParamsTemp.paramObj['0020'] == 0">
									定时汇报
								</div>
								<div v-if="editParamsTemp.paramObj['0020'] == 1">
									定距汇报
								</div>
								<div v-if="editParamsTemp.paramObj['0020'] == 2">
									定时和定距汇报
								</div>
							</template>
						</td>
						<td>位置汇报方案</td>
						<td>
							<template v-if="editParamsTemp.paramObj['0021']">
								<div v-if="editParamsTemp.paramObj['0021'] == 0">
									根据ACC状态
								</div>
								<div v-if="editParamsTemp.paramObj['0021'] == 1">
									<el-tooltip class="item" effect="dark" content="根据登录状态和ACC状态,先判断登录状态,若登录再根据ACC状态" placement="bottom">
								      	<el-button>根据登录状态和ACC状态,先判断登录状态,若登录再根据ACC状态</el-button>
								    </el-tooltip>
								</div>
							</template>
						</td>
						<td>休眠时汇报时间间隔</td>
						<td>
							<template v-if="editParamsTemp.paramObj['0027']">
								{{editParamsTemp.paramObj['0027']}}(s)
							</template>
						</td>
					</tr>
					<tr>
						<td class="lineHeight20">紧急报警时汇报时间间隔</td>
						<td>
							<template v-if="editParamsTemp.paramObj['0028']">
								{{editParamsTemp.paramObj['0028']}}(s)
							</template>
						</td>
						<td>缺省时间汇报间隔s</td>
						<td>
							<template v-if="editParamsTemp.paramObj['0029']">
								{{editParamsTemp.paramObj['0029']}}(s)
							</template>
						</td>
						<td>缺省距离汇报间隔</td>
						<td>
							<template v-if="editParamsTemp.paramObj['002C']">
								{{editParamsTemp.paramObj['002C']}}(m)
							</template>
						</td>
					</tr>
					<tr>
						<td>休眠时汇报距离间隔</td>
						<td>
							<template v-if="editParamsTemp.paramObj['002E']">
								{{editParamsTemp.paramObj['002E']}}(m)
							</template>
						</td>
						<td class="lineHeight20">紧急报警时汇报距离间隔</td>
						<td>
							<template v-if="editParamsTemp.paramObj['002F']">
								{{editParamsTemp.paramObj['002F']}}(m)
							</template>
						</td>
						<td>电子围栏半径</td>
						<td>
							<template v-if="editParamsTemp.paramObj['0031']">
								{{editParamsTemp.paramObj['0031']}}(m)
							</template>
						</td>
					</tr>
					<tr>
						<td>拐点补传角度</td>
						<td>
							<template v-if="editParamsTemp.paramObj['0030']">
								{{editParamsTemp.paramObj['0030']}}
							</template>
						</td>
						<td>最高速度</td>
						<td>
							<template v-if="editParamsTemp.paramObj['0055']">
								{{editParamsTemp.paramObj['0055']}}(km/h)
							</template>
						</td>
						<td>超速持续时间</td>
						<td>
							<template v-if="editParamsTemp.paramObj['0056']">
								{{editParamsTemp.paramObj['0056']}}(s)
							</template>
						</td>
					</tr>
					<tr>
						<td>连续驾驶时间门限</td>
						<td>
							<template v-if="editParamsTemp.paramObj['0057']">
								{{editParamsTemp.paramObj['0057']}}(s)
							</template>
						</td>
						<td class="lineHeight20">当天累计驾驶时间门限</td>
						<td>
							<template v-if="editParamsTemp.paramObj['0058']">
								{{editParamsTemp.paramObj['0058']}}(s)
							</template>
						</td>
						<td>最小休息时间</td>
						<td>
							<template v-if="editParamsTemp.paramObj['0059']">
								{{editParamsTemp.paramObj['0059']}}(s)
							</template>
						</td>
					</tr>
					<tr>
						<td>最长停车时间</td>
						<td>
							<template v-if="editParamsTemp.paramObj['005A']">
								{{editParamsTemp.paramObj['005A']}}(s)
							</template>
						</td>
						<td>机动车号牌</td>
						<td>
							<template v-if="editParamsTemp.paramObj['0083']">
								{{editParamsTemp.paramObj['0083']}}
							</template>
						</td>
						<td>GNSS定位模式</td>
						<td>
							<template v-if="editParamsTemp.paramObj['0090']">
								<el-tooltip class="item" effect="dark" :content="editParamsTemp.paramObj['0090']" placement="bottom">
							      	<el-button>{{editParamsTemp.paramObj['0090']}}</el-button>
							    </el-tooltip>
							</template>
						</td>
					</tr>
					<tr>
						<td>GNSS波特率</td>
						<td>
							<template v-if="editParamsTemp.paramObj['0091']">
								<div v-if="editParamsTemp.paramObj['0091'] == 0x00">
									4800
								</div>
								<div v-if="editParamsTemp.paramObj['0091'] == 0x01">
									9600
								</div>
								<div v-if="editParamsTemp.paramObj['0091'] == 0x02">
									19200
								</div>
								<div v-if="editParamsTemp.paramObj['0091'] == 0x03">
									38400
								</div>
								<div v-if="editParamsTemp.paramObj['0091'] == 0x04">
									57600
								</div>
								<div v-if="editParamsTemp.paramObj['0091'] == 0x05">
									115200
								</div>
							</template>
						</td>
						<td>GNSS输出频率</td>
						<td>
							<template v-if="editParamsTemp.paramObj['0092']">
								<div v-if="editParamsTemp.paramObj['0092'] == 0x00">
									500ms
								</div>
								<div v-if="editParamsTemp.paramObj['0092'] == 0x01">
									1000ms
								</div>
								<div v-if="editParamsTemp.paramObj['0092'] == 0x02">
									2000ms
								</div>
								<div v-if="editParamsTemp.paramObj['0092'] == 0x03">
									3000ms
								</div>
								<div v-if="editParamsTemp.paramObj['0092'] == 0x04">
									4000ms
								</div>
							</template>
						</td>
						<td>GNSS采集频率</td>
						<td>
							<template v-if="editParamsTemp.paramObj['0093']">
								{{editParamsTemp.paramObj['0093']}}(s)
							</template>
						</td>
					</tr>
					<tr>
						<td class="lineHeight20">GNSS模块详细定位数据上传方式</td>
						<td>
							<template v-if="editParamsTemp.paramObj['0094']">
								<div v-if="editParamsTemp.paramObj['0094'] == 0x00">
									本地存储,不上传
								</div>
								<div v-if="editParamsTemp.paramObj['0094'] == 0x01">
									按时间间隔上传
								</div>
								<div v-if="editParamsTemp.paramObj['0094'] == 0x02">
									按距离间隔上传
								</div>
								<div v-if="editParamsTemp.paramObj['0094'] == 0x0B">
									<el-tooltip class="item" effect="dark" content="按累计时间上传,达到传输时间后自动停止上传" placement="bottom">
								      	<el-button>按累计时间上传,达到传输时间后自动停止上传</el-button>
								    </el-tooltip>
								</div>
								<div v-if="editParamsTemp.paramObj['0094'] == 0x0C">
									<el-tooltip class="item" effect="dark" content="按累计距离上传,达到距离后自动停止上传" placement="bottom">
								      	<el-button>按累计距离上传,达到距离后自动停止上传</el-button>
								    </el-tooltip>
								</div>
								<div v-if="editParamsTemp.paramObj['0094'] == 0x0D">
									<el-tooltip class="item" effect="dark" content="按累计条数上传,达到上传条数后自动停止上传" placement="bottom">
								      	<el-button>按累计条数上传,达到上传条数后自动停止上传</el-button>
								    </el-tooltip>
								</div>
							</template>
						</td>
						<td class="lineHeight20">GNSS模块详细定位数据上传设置</td>
						<td>
							<template v-if="editParamsTemp.paramObj['0095']">
								<div v-if="editParamsTemp.paramObj['0095'] == 0x01">
									{{editParamsTemp.paramObj['0095']}}(s)
								</div>
								<div v-if="editParamsTemp.paramObj['0095'] == 0x02">
									{{editParamsTemp.paramObj['0095']}}(m)
								</div>
								<div v-if="editParamsTemp.paramObj['0095'] == 0x0B">
									{{editParamsTemp.paramObj['0095']}}(s)
								</div>
								<div v-if="editParamsTemp.paramObj['0095'] == 0x0C">
									{{editParamsTemp.paramObj['0095']}}(m)
								</div>
								<div v-if="editParamsTemp.paramObj['0095'] == 0x0D">
									{{editParamsTemp.paramObj['0095']}}(条)
								</div>
							</template>
						</td>
						<td></td>
						<td></td>
					</tr>
				</table>
				<div v-if="!isTableShow" class="video-info-table">
					<table width="100%" cellspacing="0" cellpadding="0">
						<tr>
							<td>输入音频编码方式</td>
							<td>
								<template v-if="editParamsTemp.audioType">
									{{editParamsTemp.audioType}}
								</template>
							</td>
							<td>输入音频声道数</td>
							<td>
								<template v-if="editParamsTemp.audioNum">
									{{editParamsTemp.audioNum}}
								</template>
							</td>
						</tr>
						<tr>
							<td>输入音频采样率</td>
							<td>
								<template v-if="editParamsTemp.audioSampRates">
									{{editParamsTemp.audioSampRates}}
								</template>
							</td>
							<td>输入音频采样位数</td>
							<td>
								<template v-if="editParamsTemp.audioSampBit">
									{{editParamsTemp.audioSampBit}}
								</template>
							</td>
						</tr>
						<tr>
							<td>音频帧长度</td>
							<td>
								<template v-if="editParamsTemp.audioFrameLen">
									{{editParamsTemp.audioFrameLen}}
								</template>
							</td>
							<td>是否支持音频输出</td>
							<td>
								<template v-if="editParamsTemp.allowAudio">
									{{editParamsTemp.allowAudio}}
								</template>
							</td>
						</tr>
						<tr>
							<td>视频编码方式</td>
							<td>
								<template v-if="editParamsTemp.videoType">
									{{editParamsTemp.videoType}}
								</template>
							</td>
							<td>最大音频通道数</td>
							<td>
								<template v-if="editParamsTemp.maxAudioNum">
									{{editParamsTemp.maxAudioNum}}
								</template>
							</td>
						</tr>
						<tr>
							<td>最大视频通道数</td>
							<td>
								<template v-if="editParamsTemp.maxVideoNum">
									{{editParamsTemp.maxVideoNum}}
								</template>
							</td>
							<td>&nbsp;</td>
							<td>
								&nbsp;
							</td>
						</tr>
					</table>
				</div>
			</el-form>
		</el-dialog>
		
		<!--新增弹框-->
		<el-dialog title="新增设备" :visible.sync="addFormVisible" top="10%" lock-scroll :close-on-click-modal="false" :close-on-press-escape="false" class="dialog_input">
			<el-form class="small-space" ref="addDialogForm" :rules="rulesAdd" :model="addEqument" label-position="left" label-width="120px"
					v-loading="addLoad" element-loading-text="拼命加载中">
				<el-row>
					<el-col :span="12">
						<div class="grid-content bg-purple">
							<el-form-item label="设备IMEI号：" prop="equImei">
								<el-input v-model="addEqument.equImei" placeholder="请输入IEMI号" :maxlength="15" clearable></el-input>	
							</el-form-item>													
						    <el-form-item label="设备型号：" prop="modelId">
								<el-select v-model="addEqument.modelId" clearable placeholder="请选择设备型号">
									<el-option
									v-for="item in modelList"
									:value="item.modelId"
									:label="item.modelName"
									:key="item.modelId">
									</el-option>
								</el-select>
						    </el-form-item>
							<el-form-item label="组织机构：" prop="deptId">
								<depart_select ref="addDepartSelect" @deptIdChange="addDeptCurrentChange"></depart_select>
							</el-form-item>
						</div>
					</el-col>
					<el-col :span="12">
						<!-- <el-form-item label="sn号：" prop="sn">
							<el-input v-model="addEqument.sn" placeholder="请输入sn号"></el-input>	
						</el-form-item> -->
				        <el-form-item label="手机号：" prop="phone">
                            <el-input v-model="addEqument.phone" placeholder="请输入手机号" :maxlength="13"></el-input>	
					    </el-form-item>							
						<el-form-item label="是否支持视频" prop="superVideo">
						    <template>
   								<el-radio v-model="addEqument.superVideo" label="Y">是</el-radio>
   								<el-radio v-model="addEqument.superVideo" label="N">否</el-radio>
   							</template> 
							<!-- <el-radio-group v-model="addEqument.superVideo" @change.native.prevent="changePhoto('addDialogForm')" >
								 						      <el-radio label="Y">是</el-radio>
								 						      <el-radio label="N">否</el-radio>
								 						    </el-radio-group> -->	 
				        </el-form-item>
				        <!-- <el-form-item label="视频通道：" prop="videoChannel">
				        						    <el-checkbox :disabled = "videoChans.disableds"
				        						    :indeterminate="videoChans.isIndeterminate" 
				        						    v-model="videoChans.checkAll" 
				        						    @change="checkAllPhoto"
				        						    ref="addPhoto">全选</el-checkbox>
				        						    <el-checkbox-group 
				        						    :disabled = "videoChans.disableds"
				        						    v-model="addEqument.videoChannel"  
				        						    @change="checkedPhotoChange"> 
				        						      <el-checkbox v-for="channel in videoChannels" :label="channel" :key="channel">{{channel}}号</el-checkbox>
				        						    </el-checkbox-group>
				        						</el-form-item> -->
					</el-col>
				</el-row>
				<el-form-item class="formButton">
					<el-button @click="addFormVisible = false">取 消</el-button>
					<el-button type="primary" @click="handleCreateSubmit('addDialogForm')" class="btnColor">确 定</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
		
		<!--编辑-->
		<el-dialog title="编辑设备" :visible.sync="updateFormVisible" top="10%" lock-scroll :close-on-click-modal="false" :close-on-press-escape="false" class="dialog_input">
			<el-form class="small-space" ref="editDialogForm" :rules="rulesEdit" :model="editEqument" label-position="left" label-width="120px"
					v-loading="updateLoad" element-loading-text="拼命加载中">
				<el-row>
					<el-col :span="12">
						<div class="grid-content bg-purple">
							<el-form-item label="设备IMEI号：" prop="equImei">
								<el-input v-model="editEqument.equImei" placeholder="请输入IEMI号" :maxlength="15" clearable></el-input>	
							</el-form-item>												
						    <el-form-item label="设备型号：" prop="modelId">
								<el-select v-model="editEqument.modelId" clearable placeholder="请选择设备型号">
									<el-option
									v-for="item in modelList"
									:value="item.modelId"
									:label="item.modelName"
									:key="item.modelId">
									</el-option>
								</el-select>
						    </el-form-item>			
							<el-form-item label="组织机构：" prop="deptId">
								<depart_select ref="editDepartSelect" @deptIdChange="editDeptCurrentChange"></depart_select>
							</el-form-item>
						</div>
					</el-col>
					<el-col :span="12">
				        <el-form-item label="手机号：" prop="phone">
                            <el-input v-model="editEqument.phone" placeholder="请输入手机号" :maxlength="13"></el-input>	
					    </el-form-item>							
						<el-form-item label="是否支持视频" prop="superVideo">
							<template>
							 	<el-radio v-model="editEqument.superVideo" label="Y">是</el-radio>
							 	<el-radio v-model="editEqument.superVideo" label="N">否</el-radio>
							</template>	 	
								<!-- <el-radio-group v-model="editEqument.superVideo" @change.native.prevent="changePhoto('editDialogForm')" >
										 							     	<el-radio label="Y">是</el-radio>
										 							      	<el-radio label="N">否</el-radio>
										 							    </el-radio-group>	 -->		 
				        </el-form-item>
				        <!-- <el-form-item label="视频通道：" prop="videoChannel">
				        						    <el-checkbox :disabled = "videoChans1.disableds"
				        						    :indeterminate="videoChans1.isIndeterminate" 
				        						    v-model="videoChans1.checkAll" 
				        						    @change="checkAllPhoto"
				        						    ref="addPhoto">全选</el-checkbox>
				        						    <el-checkbox-group 
				        						    :disabled = "videoChans1.disableds"
				        						    v-model="editEqument.videoChannel"  
				        						    @change="checkedPhotoChange"> 
				        						      <el-checkbox v-for="channel in videoChannels" :label="channel" :key="channel">{{channel}}号</el-checkbox>
				        						    </el-checkbox-group>
				        						</el-form-item> -->
					</el-col>
				</el-row>
				<el-form-item class="formButton">
					<el-button @click="updateFormVisible = false">取 消</el-button>
					<el-button type="primary" @click.native.prevent="handleEditSubmit('editDialogForm')" class="btnColor">确 定</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
		
	</div>
</template>

<script>
	import "../../assets/css/index.scss";
	import { Message } from 'element-ui';
	import { validate } from 'utils/validate';
	import { utils } from 'src/utils';
	import DepartSelect from '../../components/DepartSelect';
	import Pagination from '../../components/Pagination';

	const channelOptions = ['1','2','3','4'];//录像
	export default {
		components: {
			'depart_select':DepartSelect,
			'pagination': Pagination
		 },
		data() {
			const vm =this;
            //部门验证
			const validateDepatTree = (rule, value, callback) => {
				var keys = "";
				if (vm.addFormVisible) { //新增
					keys = vm.addEqument.deptId;
				} else {//编辑
					keys = vm.editEqument.deptId;
				}
				
				if (keys == "") {
					callback(new Error('请选择部门'));
				} else {
					callback();
				}
			};
			//IEMI号唯一性验证
			const validateEquImei= (rule, value, callback) => {
				if (vm.isValidate.isOk) {
					if (vm.isValidate.equImei) {
						callback();
						return;
					}
				} else {
					vm.isValidate.equImei = false;
				}			
				if (value === '' || value === null) {
					callback(new Error('卡号不能为空'));
					return;
				} else {
					let param = {};
					param.equImei = value;
					param.flags = true;
					if (vm.updateFormVisible == true) {
						param.equId = vm.editEqument.equId;
					}			
					vm.$instance.post("/proxy/bizmgr/equ/uniqueIMEI", param).then(res =>{
						if(res.status == 200){
							//唯一
							if (res.data.success) { //新增提交
								callback();
							} else { //不唯一
								callback(new Error("IEMI号不唯一，请重新输入"));
							}
						}else{
							Message.error({message:"调用接口失败"});
							callback(new Error("调用接口失败"));
						}
					}).catch(error => {callback(new Error("调用接口失败"));});
				}
			};
			
			//手机号唯一性验证
			const validatePhone= (rule, value, callback) => {
				if (vm.isValidate.isOk) {
					if (vm.isValidate.phone) {
						callback();
						return;
					}
				} else {
					vm.isValidate.phone = false;
				}
				if (value == undefined || value === null || value === '') {
					callback(new Error('手机号不能为空'));
					return;
				}
				let param = {};
				param.phone = value;
				param.flags = true;
				if (vm.updateFormVisible == true) {
					param.equId = vm.editEqument.equId;
				}				
				vm.$instance.post("/proxy/bizmgr/equ/uniquePhone", param).then(res =>{
					if(res.status == 200){
						//唯一
						if (res.data.success) { //新增提交
							callback();
						} else { //不唯一
							callback(new Error("手机号号不唯一，请重新输入"));
						}
					}else{
						Message.error({message:"调用接口失败"});
						callback(new Error("调用接口失败"));
					}
				}).catch(error => {callback(new Error("调用接口失败"));});
			};
			
			const validateImeiLen = (rule, value, callback) => {
				if( value.length != 15) {
					callback(new Error('IMEI号为15位'));
					return;
				} else {
					callback();
				}
			};
			
			const validatePhoneLen = (rule, value, callback) => {
				if(value.charAt(0) != 1){
					callback(new Error('请输入正确的手机号'));
					return;
				}else if( value.length != 11 && value.length != 13 ) {
					callback(new Error('手机号为11位或13位'));
					return;
				} else {
					callback();
				}
			};
			//新增 修改校验 是否视频（为关闭） 通道不做校验
			const validatePhoto = (rule, value, callback) => {
				let flag = 'Y';
				if(vm.titles == "新增设备"){
					flag = vm.addEqument.superVideo;
				}else if (vm.titles == "编辑设备"){
					flag = vm.editEqument.superVideo;
					value = vm.editEqument.videoChannel;
				}
				if(flag == 'Y'){
					if (value) {
						if(value.length != undefined && value.length == 0){
							callback(new Error('请至少选择一个通道'));
						}else {
				          	callback();
				        }
			        }else {
			          	callback(new Error('请至少选择一个通道'));
			        }
				}else{
					callback();
				}
		    };
			
			return {
				//按钮的权限 查询query 新增add   true 显示  false 隐藏
				permBtn:{
	                equment_add: false,
					equment_delete: false, 
					equment_Modify: false, 
					equment_export: false,
					equment_check: false,
				},
				list: [], //表格list
				modelList: [],
				total: 0,
				listLoading: true,
				height: 540,
				
				//列表查询参数
				listQuery: {
					iDisplayLength: 10,
					iDisplayStart: 0,
					modelId: "",
					isbind: "",
					driverName: "",
					deptId: "",
					equImei: "",
					phone: ""
				},
                //唯一性验证状态记录
				isValidate:{
					equImei: false,
					phone: false,
					isOk: false   //点击确定第一时间将此变量设置为true
				},
				//树控件数据映射关系
        		defaultProps: {
          			children: 'children',
          			label: 'deptName'
				},				
				//新增数据
				addEqument: {
					equImei: "",
					deptId: "",
					phone: "",
					modelId: "",
					superVideo: "Y",
					videoChannel: [] //视频通道
				},
				//编辑数据
				editEqument: {
					equId: "",
					equImei: "",
					phone: "",
					deptId: "",
					modelId: "",
					superVideo: "",
					videoChannel: [] //视频通道
				},
				editParamsTemp: {
					paramObj : {}
				},//查看详情数据
				waitTime: null, //编辑时，部门树需要回填数据，使用定时器等待树控件创建
				//新增编辑数据校验
				rulesAdd: {
                    equImei: [
                    	{ required: true, validator: validateImeiLen, trigger: 'blur' },
						{ required: true, validator: validateEquImei, trigger: 'blur' },
					],
					phone: [
						{ required: true, validator: validatePhoneLen, trigger: 'blur' },
						{ required: true, validator: validatePhone, trigger: 'blur'},
					],
					modelId: [
						{ required: true, message: '请选择设备型号', trigger: 'change'}
					],
					deptId: [
						{ required: true, validator: validateDepatTree, trigger: 'change'}
					],
					videoChannel: [
						{ type: 'array', required: true, trigger: 'change', validator: validatePhoto}
					],
				},
				rulesEdit: {
					equImei: [
						{ required: true, validator: validateImeiLen, trigger: 'blur' },
						{ required: true, validator: validateEquImei, trigger: 'blur' },
					],
					phone: [
						{ required: true, validator: validatePhoneLen, trigger: 'blur' },
						{ required: true, validator: validatePhone, trigger: 'blur'},
					],
					modelId: [
						{ required: true, message: '请选择设备型号', trigger: 'change'}
					],
					deptId: [
						{ required: true, validator: validateDepatTree, trigger: 'change'}
					]
				},
				roleNamesCheck: "", //查看需要的角色名称
                // 弹窗
				addFormVisible: false,
				updateFormVisible: false,
				checkFormVisible: false,
				webSocket: null,
				listAllLoading: false,
				//loadDialogVisible: false,
			//十进制转二进制  当二进制中为1时,对应的解析数据
				GNSSArr: ['启用 GPS定位', '启用北斗定位', '启用 GLONASS定位', '启用 Galileo定位'],//GNSS 定位模式
				infoLists: null,
				addLoad: false,//新增加载状态
				updateLoad: false,//修改加载状态
				videoChannels: channelOptions,//视频通道
				//新增通道
				videoChans: {
					checkAll: false,//默认不全选
					isIndeterminate: false,//全选状态
					disableds: false//默认通道可选择
				},
				//修改通道
				videoChans1: {
					checkAll: false,//默认不全选
					isIndeterminate: false,//全选状态
					disableds: false//默认通道可选择
				},
				tabindex: 0,//用于切换Tab的选中状态，添加class
				videoIfon: false,//视频信息按钮是否显示
				isTableShow: true,//详情表格是否显示
			}
		},
		mounted() {
			var vm = this;
			utils.getTableHeight((height)=>{
				this.height = height;
			});
			vm.getPerm();
			vm.getList();
			vm.getModelList();
		},
		//实例销毁之间调用。在这一步，实例仍然完全可用。   时间定时器
		beforeDestroy(){
			if(this.waitTime){
				this.waitTime = clearInterval(this.waitTime); //去掉定时器的方法   同一个变量做定时器
			};

			if (this.webSocket != null) {
				this.webSocket.close();
			};
		},
		methods: {
			//通道全选
			checkAllPhoto(val) {
		        this.addEqument.videoChannel = val ? channelOptions : [];
		        this.videoChans.isIndeterminate = false;
		    },
		    //通道反选
		    checkedPhotoChange(value) {
		        let checkedCount  = value.length;
		        this.videoChans.checkAll = checkedCount === this.videoChannels.length;
		        this.videoChans.isIndeterminate = checkedCount > 0 && checkedCount < this.videoChannels.length;
		    },
		    //修改拍照全选
			checkAllPhoto1(val) {
		        this.editEqument.videoChannel = val ? channelOptions : [];
		        this.videoChans1.isIndeterminate = false;
		    },
		    //修改拍照反选
		    checkedPhotoChange1(value) {
		        let checkedCount  = value.length;
		        this.videoChans1.checkAll = checkedCount === this.videoChannels.length;
		        this.videoChans1.isIndeterminate = checkedCount > 0 && checkedCount < this.videoChannels.length;
		    },
		    //是否拍照 1：开 0：关
			changePhoto(par,para){
				let formRef = "";
				if(par == "addDialogForm"){
					if(this.addEqument.superVideo == 'Y'){
						this.videoChans.disableds = false;//通道可选择
					}else if(this.addEqument.superVideo == 'N'){
						this.videoChans.disableds = true;//通道不可选择
					}
					formRef = "addDialogForm";
				}else if(par == "editDialogForm"){
					if(this.editEqument.superVideo == 'Y'){
						this.videoChans.disableds = false;//通道可选择
					}else if(this.editEqument.superVideo == 'N'){
						this.videoChans.disableds = true;//通道不可选择
					}
					formRef = "editDialogForm";
				}
				if(!para){
					//this.$refs[formRef].validateField('videoChannel');//单独校验
				}
			},
			//获取当前页面的权限
			getPerm(){
				this.permBtn = utils.permsButton(this);
			},
			//获取列表数据
			//isBackHome 是否返回首页
			getList(isBackHome = false) {
				if (isBackHome) {
					if (this.listQuery.iDisplayStart != 0) {
						this.$refs.page.backFirstPage();
						return;
					}
				}
				var vm = this;
				vm.listLoading = true;
				//调用接口
				let param = JSON.parse(JSON.stringify(vm.listQuery));
		        vm.$instance.post("/proxy/bizmgr/equ/findEquList", param).then(res =>{	
		            vm.listLoading = false;						
		          	if(res.status == 200){			
		                vm.list = res.data.data;
						vm.total = res.data.contTotal;
		            }else{
		                Message.error({message:"调用接口失败"});
		            }
		        }).catch(error => {
		        	vm.listLoading = false;	
		        });
			},
			//获取设备类型列表
			getModelList(){
				var vm = this;
				vm.$instance.get("/proxy/bizmgr/equ/findModelList",{}).then(res =>{
					if(res.status == 200){
						vm.modelList = res.data;
					} else {
						Message.error({message:"调用接口失败"});
					}
				}).catch(error => {
					
				});
			},
			//根据Id获取数据
			getEquImeiData(equId) {
				let vm = this;
				let param = {};
				param.equId = equId;
				//调用接口
				vm.$instance.get("/proxy/bizmgr/equ/findEquInfo", {params: param}).then(res =>{
					if(res.status == 200){
						    for (var i in vm.editEqument){
							    vm.editEqument[i] = vm.editEqument[i] || res.data[i];
							}
							vm.updateFormVisible = true;
	                        if (vm.$refs.editDepartSelect) {
								vm.$refs.editDepartSelect.setCurrentSelect(vm.editEqument.deptId);
							} else {
								vm.waitTime = window.setInterval(()=>{
									if (vm.$refs.editDepartSelect) {
										vm.waitTime = window.clearInterval(vm.waitTime);
										vm.$refs.editDepartSelect.setCurrentSelect(vm.editEqument.deptId);
									}
								}, 100);
							}
					}else{
						Message.error({message:"调用接口失败"});
					}
				}).catch(error => { 
					vm.updateFormVisible = false; 
					Message.error({message:"数据获取失败！"});
				});
			},
			/**
			 * 分页改变，加载数据
			 */
			paginationChange(pageData) {
				this.listQuery.iDisplayStart = pageData.iDisplayStart;
				this.listQuery.iDisplayLength = pageData.iDisplayLength;
				this.getList();
			},
			//新增部门选择改变
			addDeptCurrentChange(deptId){
				this.addEqument.deptId = deptId;
				this.$refs.addDialogForm.validateField("deptId");
			},
			//新增编辑部门选择改变
			editDeptCurrentChange(deptId){
				this.editEqument.deptId = deptId;
				this.$refs.editDialogForm.validateField("deptId");
			},
			deptCurrentChange(deptId) {
				this.listQuery.deptId = deptId;
			},
			//打开新增弹窗
			handleCreate() {
				this.isValidate.equImei = false;
				this.isValidate.phone = false;
				this.isValidate.isOk = false;
				let obj = this.addEqument;
				for (const item in obj) {
					if (obj.hasOwnProperty(item)) {
						obj[item] = "";					
					}
				}
				obj.superVideo = "Y";
				if (this.$refs.addDepartSelect) {
					this.$refs.addDepartSelect.deptClear();
				}
				this.addEqument.videoChannel = [];
				this.checkAll = false;
				this.isIndeterminate = false;
				this.disableds = false;
				//this.$refs.addDialogForm.clearValidate();//移除校验结果
				this.resetForm("addDialogForm");
				this.addFormVisible = true;
			},
			//新增确定
			handleCreateSubmit(formName) {
				this.isValidate.isOk = true;
				validate.isValidate(this, formName, (formData)=>{
					if(formData.validates){
						this.createSubmit();
					}
					this.isValidate.isOk = false;
				});
			},		
			//新增设备提交
			createSubmit() {
				var vm = this;
				vm.addLoad = true;
				let params = JSON.parse(JSON.stringify(vm.addEqument));
				vm.$instance.post("/proxy/bizmgr/equ/addEqu", params).then(res =>{
					vm.addLoad = false;
					if(res.status == 200){
						if (res.data.success) {
							vm.addFormVisible = false;	
							Message({
					          showClose: true,
					          message: '新增成功',
					          type: 'success',
					          duration: 1000 ,
					          onClose: function(){
					          	vm.getList(true);
					          }
					        });
						} else {
							Message.error({message:res.data.errorMsg});
						}						
					}else{
						Message.error({message:"调用接口失败"});
					}
				}).catch(error => {
					vm.addLoad = false;
					Message.error({message:"添加失败！"});
				});
			},
			
			//查看
			check(index, row){
				let vm = this;
				vm.listAllLoading = true;
				vm.isTableShow = true;
				vm.tabindex = 0;
				if (row.superVideo == 'Y') {//支持视频
					vm.videoIfon = true;
				} else{
					vm.videoIfon = false;
				}
				let param = {};
				vm.getInfo(param, row);
			},
			
			getInfo(param, row) {
				let vm = this;
				vm.editParamsTemp = {};
				vm.editParamsTemp.paramObj = {};
				let websocketParam = {
					account: vm.$store.getters.userInfo.account,//账号
					entId: vm.$store.getters.userInfo.entId,//企业ID
					equId: row.equId,
					phone: row.phone,
					protocolType: row.protocolType,//协议类型
					type: "equ",
				};

				let sendParam = JSON.stringify(websocketParam);
				if (vm.webSocket != null) {
					vm.webSocket.send(sendParam);//向远程服务器发送数据
					return;
				}
				/*请求webSocketUrl*/		
				vm.$instance.get("/proxy/config/findwebsocket", {params: param}).then(res =>{
		          	if(res.status == 200){
		          		let websocketParam = {};
						
						let webSocketUrl = res.data.ip + ":" + res.data.port;//获取websocket信息   ip + port
						/*实现化WebSocket对象，指定要连接的服务器地址与端口*/
						vm.webSocket = new WebSocket('ws://' + webSocketUrl + '/websocket');
						
						/*当网络连接建立时触发该事件*/
						vm.webSocket.onopen = function(event) {
							vm.webSocket.send(sendParam);//向远程服务器发送数据
						};
						
						/*当websocket接收到服务器发来的消息的时触发的事件*/
						vm.webSocket.onmessage = function(msg) {
							vm.listAllLoading = false;
							if(msg.data == 1){
								vm.$message({
						          	message: '车辆不在线',
						          	type: 'warning',
						          	duration: '1500'
						        });
							} else {
								vm.analysisData(JSON.parse(msg.data));
								vm.checkFormVisible = true;
							}
						};
						
						vm.webSocket.onerror = function(e) {
							vm.webSocket.close();
							vm.webSocket = null;
						};
						
		            }else{
		                Message.error({message:"调用接口失败"});
		            }
		        }).catch(error => {
					vm.webSocket = null;
		        	vm.checkFormVisible = false;
		        	vm.listAllLoading = false;
		        });
			},
			
			//Tab的显示隐藏
		    tabShow(index) {
		    	this.tabindex = index;
		    	if (index == 0) {
		    		this.isTableShow = true;
		    	} else if (index == 1) {
					this.isTableShow = !this.isTableShow;
		    	}
		    },
			
			//解析详情数据
			analysisData(data){
				let vm = this;
				let paramObj = {};
				if (data.paramItemList) {
					let paramItemList = JSON.parse(data.paramItemList);
					for (var i=0; i<paramItemList.length; i++) {
						let paramKey = paramItemList[i].paramId;
						let paramVal = paramItemList[i].paramVal;
						if(paramKey == '0090' && paramVal != null){
							paramObj[paramKey] = vm.analysisData_to_two(paramVal, vm.GNSSArr);
						} else {
							paramObj[paramKey] = paramVal;
						}
					}
					Object.assign(vm.editParamsTemp.paramObj, paramObj);
				} else {
					Object.assign(vm.editParamsTemp, data);//对象的合并Object.assign(目标对象, 源对象)
				}
				vm.checkFormVisible = false;//强制刷新DOM结构(数据分批次返回后,DOM结构绑定不上之后返回的数据,需刷新)
				vm.checkFormVisible = true;
			},
			
			//解析数据中的十进制参数
			analysisData_to_two(val, dataArr){
				let str = '';
				if (val != 0) {
					let arr = val.toString(2).split("").reverse();//十进制转二进制，拆分成数组，再反转
					for (var j=0; j<arr.length; j++) {
						if (arr[j] == 1) {
							str += dataArr[j] + ',';
						}
					}
					str = str.substr(0, str.length - 1);//删除str中最后一个  ,
				}
				return str;
			},
			
			//删除
			handleDelete(index, row) {
				var vm = this;
				if(row.isbind){
					this.$message({
			          	message: '此设备被绑定，不能删除，请解绑后进行删除！',
			          	type: 'warning',
			          	duration: '1500'
			        });
		    		return;
				}
				let param = {};
				param.equId = row.equId;
				//确定删除
				this.$confirm('是否删除< '+ row.equImei +' >设备！', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					//调用接口
					vm.$instance.post("/proxy/bizmgr/equ/deleteEqu", param).then(res =>{
						if(res.status == 200){
							if (res.data.success) {
								Message.success({message: '删除成功！'});
								vm.$refs.page.deleteItemReLoadList();
							} else {
								Message.error({message:res.data.errorMsg});
							}
						}else{
							Message.error({message:"调用接口失败"});
						}
					}).catch(error => {});
				}).catch(() => {
					Message.info({message: '已取消删除'});          
				});
			},
			//修改获取信息
			handleEdit(index, row) {
				for(var i in this.editEqument){
					this.editEqument[i] = ""
				}
				if(row.isbind){
					this.$message({
			          	message: '此设备被绑定，不能修改！',
			          	type: 'warning',
			          	duration: '1500'
			        });
		    		return;
				}
				this.isValidate.equImei = false;
				this.isValidate.phone = false;
				this.isValidate.isOk = false;
				let obj = this.editEqument;
				for (const item in obj) {
					if (obj.hasOwnProperty(item)) {
						obj[item] = ""						
					}
				}
				this.editEqument.equId = row.equId;
				this.getEquImeiData(row.equId)						
			},
			//修改确定
		    handleEditSubmit(formName) {
				this.isValidate.isOk = true;
				validate.isValidate(this, formName, (formData)=>{
					if(formData.validates){
						this.editSubmit();
					}
					vm.isValidate.isOk = false;
				});
			},
			//修改提交
		    editSubmit() {
				var vm = this;
				vm.updateLoad = true;
				vm.$instance.post("/proxy/bizmgr/equ/modifyEqu", JSON.parse(JSON.stringify(vm.editEqument))).then(res =>{
					vm.updateLoad = false;
					if(res.status == 200){
						if (res.data.success) {
							vm.updateFormVisible = false;
							Message({
					          showClose: true,
					          message: '修改成功',
					          type: 'success',
					          duration: 1000 ,
					          onClose: function(){	
								vm.getList();
					          }
					        });
						} else {
							Message.error({message:res.data.errorMsg});
						}
					}else{
						Message.error({message:"调用接口失败"});
					}
				}).catch(error => {
					vm.updateLoad = false;
					vm.updateFormVisible = false;
				});
			},
			resetForm(formName) {
        		if (this.$refs[formName] !== undefined) {
					this.$refs[formName].resetFields();
				}
			},
			//新增编辑部门选择改变
			deptTreeSelectChange(data, status){
				if (status.checkedNodes.length == 0) {
					return;
				}
				//设置只选择当前点击的
				var checkKeys = [];
				checkKeys.push(data.deptId);
				if (this.addFormVisible) {//新增
					this.$refs.addDeptTree.setCheckedKeys(checkKeys);
				} else {//编辑
					this.$refs.editDeptTree.setCheckedKeys(checkKeys);
				}
			},	
			
      	//导出
      		exportFormLists() {
				utils.exportLists(this.listQuery, "/proxy/bizmgr/equ/exportEqu");
      		},  
		}
	}
	
</script>

<style rel="stylesheet/scss" lang="scss">
	.tab-active{
		background: #566fc9 !important;
		color: #fff !important;
	}
	.equ-tab button{
		border-radius: 0;
		padding: 10px 20px;
		float: left;
		margin: 0;
		background: #f2f2f2;
	}
	.equ-tab .el-button + .el-button{
		margin: 0 !important;
	}
	.device-imei>div>div {
		cursor: pointer;
		width: 160px;
		height: 30px;
		line-height: 30px;
		padding: 0 10px;
		color: #c0c4cc;
		border: 1px solid #dcdfe6;
		border-radius: 4px;
	}
	
	.box .el-dialog {
		width: 25%;
	}
	
	.el-tabs__nav-wrap::after{
		background: none;
	}
	
	.el-tabs__item{
		border: 1px solid #e9e9e9;
		text-align: center;
		border-radius: 4px;
		-webkit-border-radius: 4px;
    	-moz-border-radius: 4px;
    	padding: 0 30px !important;
	}
	.el-tabs__item.is-active{
		background: #1e4d78;
		border: 1px solid #1e4d78;
		color: #fff;
	}
	.el-tabs__active-bar{
		background: none;
	}
	.box form{
		padding-left: 50px;
	}
	.dialogDeptTree {
		border: 1px solid #ddd;
		max-height: 150px;
		overflow-y: auto; 
	}
	.text-btn{
		cursor: pointer;
		color: blue;
	}
	.editBox{
		.el-dialog__body{
			padding-bottom: 20px;
		}
		table{
			border-bottom: 1px solid #e4e7ea;
			tr{
				border-left: 1px solid #e4e7ea;
				td{
					display: inline-block;
					float: left;
					width: 140px;
					border: 1px solid #e4e7ea;
					border-bottom: none;
					border-left: none;
					height: 40px;
					line-height: 40px;
					text-align: center;
					div{
						height: 40px;
						line-height: 40px;
						margin: 0 auto;
					}
				}
				td:nth-child(odd){
					background: #f7f9ff;
				}
			}
		}
		.lineHeight20{
			line-height: 20px !important;
		}
	}
	.terminal-info{
		td button{
			width: 120px;
		    padding: 0;
		    overflow: hidden;
		    white-space: nowrap;
		    text-overflow: ellipsis;
		    border: none;
		    &:focus, &:hover{
		    	background: none;
		    }
		}
		.el-tooltip__popper{
			margin-top: 7px;
			padding: 5px 10px;
		}
	}
	.video-info-table{
		height: 517px;
		td{
			width: 210px !important;
		}
	}
</style>
