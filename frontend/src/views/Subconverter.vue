<template>
  <div class="page-container studio-page">
    <section class="studio-hero">
      <div class="hero-copy">
        <p v-if="app.productTagline" class="eyebrow">{{ app.productTagline }}</p>
        <h1>{{ app.productName }}</h1>
        <p v-if="app.description" class="hero-description">
          {{ app.description }}
        </p>
        <div class="hero-actions">
          <el-tag size="medium" effect="plain">单一入口</el-tag>
          <el-tag size="medium" effect="plain">运行时可配置</el-tag>
          <el-tag size="medium" effect="plain">内置短链</el-tag>
        </div>
      </div>
      <button class="theme-toggle studio-theme-toggle" @click="handleThemeToggle">
        <i id="rijian" class="el-icon-sunny"></i>
        <i id="yejian" class="el-icon-moon"></i>
      </button>
    </section>

    <el-row :gutter="20" class="studio-grid" type="flex">
      <el-col :xs="24" :lg="24">
        <el-card class="studio-card">
          <div slot="header" class="card-header">
            <div>
              <div class="card-title">转换工作区</div>
              <div class="card-subtitle">在一个工作区完成生成、检查与分享。</div>
            </div>
            <el-tag size="small" type="info">{{ sourceCount }} 条来源</el-tag>
          </div>

          <el-form :model="form" label-position="top" class="studio-form">
            <el-alert
              v-if="showEngineBanner"
              :title="engineBannerText"
              :type="engineBannerType"
              :closable="false"
              show-icon
              class="engine-alert"
            />

            <el-form-item label="来源订阅">
              <el-input
                v-model="form.sourceSubUrl"
                type="textarea"
                rows="5"
                placeholder="粘贴一个或多个订阅链接，多条可用换行或 | 分隔。"
              />
            </el-form-item>

            <el-row :gutter="16">
              <el-col :xs="24" :md="24">
                <el-form-item label="输出客户端">
                  <el-select v-model="form.clientType" style="width: 100%">
                    <el-option
                      v-for="item in clientPresets"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="规则模板">
              <el-select
                v-model="form.remoteConfig"
                filterable
                clearable
                allow-create
                default-first-option
                placeholder="可从预设中选择，或直接输入模板 URL（留空则使用内置默认）"
                style="width: 100%"
              >
                <el-option-group
                  v-for="group in remoteProfileGroups"
                  :key="group.label"
                  :label="group.label"
                >
                  <el-option
                    v-for="item in group.options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-option-group>
              </el-select>
            </el-form-item>

            <el-collapse>
              <el-collapse-item>
                <template slot="title">
                  <el-button class="advanced-toggle" icon="el-icon-setting" style="width: 100%">
                    高级路由与兼容参数
                  </el-button>
                </template>

                <el-row :gutter="16">
                  <el-col :xs="24" :md="12">
                    <el-form-item label="仅包含节点">
                      <el-input v-model="form.includeRemarks" placeholder="支持正则表达式" />
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :md="12">
                    <el-form-item label="排除节点">
                      <el-input v-model="form.excludeRemarks" placeholder="支持正则表达式" />
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row :gutter="16">
                  <el-col :xs="24" :md="12">
                    <el-form-item label="重命名规则">
                      <el-input v-model="form.rename" placeholder="示例：a@b|1@2" />
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :md="12">
                    <el-form-item label="订阅文件名">
                      <el-input v-model="form.filename" placeholder="客户端中显示的名称" />
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row :gutter="16">
                  <el-col :xs="24" :md="12">
                    <el-form-item label="Quantumult X 设备 ID">
                      <el-input v-model="form.devid" placeholder="可选设备标识" />
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :md="12">
                    <el-form-item label="刷新间隔（天）">
                      <el-input v-model="form.interval" placeholder="会自动转换为秒传给引擎" />
                    </el-form-item>
                  </el-col>
                </el-row>

                <div class="option-grid">
                  <el-checkbox v-model="form.nodeList" border>仅输出节点列表</el-checkbox>
                  <el-checkbox v-model="form.emoji">启用 Emoji 标签</el-checkbox>
                  <el-checkbox v-model="form.insert">插入默认节点</el-checkbox>
                  <el-checkbox v-model="form.udp">启用 UDP</el-checkbox>
                  <el-checkbox v-model="form.xudp">启用 XUDP</el-checkbox>
                  <el-checkbox v-model="form.tfo">启用 TFO</el-checkbox>
                  <el-checkbox v-model="form.sort">节点排序</el-checkbox>
                  <el-checkbox v-model="form.appendType">追加节点类型</el-checkbox>
                  <el-checkbox v-model="form.tls13">启用 TLS 1.3</el-checkbox>
                  <el-checkbox v-model="form.expand">展开规则</el-checkbox>
                  <el-checkbox v-model="form.new_name">使用 Clash new_name</el-checkbox>
                  <el-checkbox v-model="form.scv">跳过证书校验</el-checkbox>
                  <el-checkbox v-model="form.fdn">过滤不兼容节点</el-checkbox>
                  <el-checkbox v-model="form.tpl.clash.doh">Clash DoH</el-checkbox>
                  <el-checkbox v-model="form.tpl.surge.doh">Surge DoH</el-checkbox>
                  <el-checkbox v-model="form.tpl.singbox.ipv6">Sing-Box IPv6</el-checkbox>
                </div>
              </el-collapse-item>
            </el-collapse>

            <div class="action-row">
              <el-button
                type="primary"
                size="medium"
                :disabled="!canGenerateSubscription"
                @click="makeUrl"
              >
                生成订阅链接
              </el-button>
              <el-button
                type="primary"
                size="medium"
                :loading="loading1"
                :disabled="!customSubUrl"
                @click="makeShortUrl"
              >
                生成短链接
              </el-button>
              <el-button
                v-if="app.configUploadEndpoint"
                type="default"
                icon="el-icon-upload"
                @click="dialogUploadConfigVisible = true"
              >
                上传模板
              </el-button>
              <el-button type="default" icon="el-icon-link" @click="dialogLoadConfigVisible = true">
                从链接导入
              </el-button>
            </div>

            <el-form-item label="生成结果（订阅链接）">
              <el-input v-model="customSubUrl" class="copy-content" readonly>
                <el-button
                  slot="append"
                  icon="el-icon-document-copy"
                  v-clipboard:copy="customSubUrl"
                  v-clipboard:success="onCopy"
                >
                  复制
                </el-button>
              </el-input>
            </el-form-item>

            <el-form-item label="短链接">
              <el-input
                v-model="customShortSubUrl"
                class="copy-content"
                placeholder="可先输入自定义短链后缀，再点击生成"
              >
                <el-button
                  slot="append"
                  icon="el-icon-document-copy"
                  v-clipboard:copy="customShortSubUrl"
                  v-clipboard:success="onCopy"
                >
                  复制
                </el-button>
              </el-input>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog
      v-if="app.configUploadEndpoint"
      :visible.sync="dialogUploadConfigVisible"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      width="80%"
      title="上传自定义模板"
    >
      <el-link type="primary" :href="sampleConfig" target="_blank" icon="el-icon-document">
        打开默认模板示例
      </el-link>
      <el-form label-position="top" class="dialog-form">
        <el-form-item label="模板内容">
          <el-input
            v-model="uploadConfig"
            type="textarea"
            :autosize="{ minRows: 15, maxRows: 15 }"
            maxlength="50000"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeUploadDialog">取消</el-button>
        <el-button type="primary" :disabled="!uploadConfig.length" @click="confirmUploadConfig">上传</el-button>
      </div>
    </el-dialog>

    <el-dialog
      :visible.sync="dialogLoadConfigVisible"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      width="80%"
      title="导入已有工作链接"
    >
      <el-form label-position="top" class="dialog-form">
        <el-form-item label="订阅链接或短链接">
          <el-input
            v-model="loadConfig"
            type="textarea"
            :autosize="{ minRows: 10, maxRows: 10 }"
            maxlength="5000"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeImportDialog">取消</el-button>
        <el-button type="primary" :disabled="!loadConfig.length" @click="confirmLoadConfig">导入</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { appConfig } from '@/config/app'
import { createDefaultFormState } from '@/config/form'
import {
  CLIENT_PRESETS,
  REMOTE_PROFILE_GROUPS
} from '@/config/presets'
import {
  fetchSystemStatus,
  createShortLink,
  uploadRemoteConfig
} from '@/services/gateway'
import {
  applyThemePreference,
  detectDevice,
  observeThemePreference,
  toggleTheme
} from '@/utils/theme'
import {
  buildSubscriptionUrl,
  hydrateFormFromUrl,
  resolveImportUrl
} from '@/utils/subscription'

export default {
  data() {
    return {
      app: appConfig,
      engineSystemStatus: {
        mode: 'embedded',
        status: 'starting',
        message: '引擎预热中',
        version: '',
        updatedAt: ''
      },
      systemStatusTimer: null,
      isPC: true,
      loading1: false,
      loading2: false,
      loading3: false,
      customSubUrl: '',
      customShortSubUrl: '',
      dialogUploadConfigVisible: false,
      dialogLoadConfigVisible: false,
      uploadConfig: '',
      loadConfig: '',
      cleanupThemeObserver: null,
      clientPresets: CLIENT_PRESETS,
      remoteProfileGroups: REMOTE_PROFILE_GROUPS,
      form: createDefaultFormState()
    }
  },
  computed: {
    sourceCount() {
      return this.form.sourceSubUrl
        .split(/\n|\|/)
        .map((item) => item.trim())
        .filter(Boolean)
        .length
    },
    sampleConfig() {
      return this.app.defaultRemoteConfig
    },
    isEngineReady() {
      return this.engineSystemStatus.status === 'ready'
    },
    canGenerateSubscription() {
      if (!this.form.sourceSubUrl.trim()) {
        return false
      }
      return this.isEngineReady
    },
    engineBannerType() {
      if (this.engineSystemStatus.status === 'error') {
        return 'error'
      }
      if (this.engineSystemStatus.status === 'ready') {
        return 'success'
      }
      return 'warning'
    },
    showEngineBanner() {
      return this.engineSystemStatus.status !== 'ready'
    },
    engineBannerText() {
      if (this.engineSystemStatus.status === 'error') {
        return `引擎启动失败：${this.engineSystemStatus.message}`
      }

      return this.engineSystemStatus.message || '引擎正在预热，你可以先继续配置。'
    }
  },
  created() {
    this.isPC = detectDevice().isPc
  },
  mounted() {
    applyThemePreference()
    this.startSystemStatusPolling()
    this.cleanupThemeObserver = observeThemePreference(() => {
      applyThemePreference()
    })
  },
  beforeDestroy() {
    this.stopSystemStatusPolling()

    if (this.cleanupThemeObserver) {
      this.cleanupThemeObserver()
    }
  },
  methods: {
    handleThemeToggle() {
      toggleTheme()
    },
    onCopy() {
      this.$message.success('已复制到剪贴板')
    },
    closeUploadDialog() {
      this.uploadConfig = ''
      this.dialogUploadConfigVisible = false
    },
    closeImportDialog() {
      this.loadConfig = ''
      this.dialogLoadConfigVisible = false
    },
    stopSystemStatusPolling() {
      if (!this.systemStatusTimer) {
        return
      }

      clearInterval(this.systemStatusTimer)
      this.systemStatusTimer = null
    },
    startSystemStatusPolling() {
      this.stopSystemStatusPolling()
      void this.syncSystemStatus()
      this.systemStatusTimer = setInterval(() => {
        void this.syncSystemStatus()
      }, 4000)
    },
    async syncSystemStatus() {
      try {
        const status = await fetchSystemStatus()
        if (status && status.engine) {
          this.engineSystemStatus = status.engine
        }
      } catch (error) {
        this.engineSystemStatus = {
          ...this.engineSystemStatus,
          status: 'error',
          message: '无法读取网关状态，请稍后重试。'
        }
      }
    },
    makeUrl() {
      if (!this.form.sourceSubUrl.trim()) {
        this.$message.error('请至少输入一条来源链接。')
        return
      }

      if (!this.isEngineReady) {
        this.$message.warning('引擎仍在预热，请稍后再试。')
        return
      }

      this.customSubUrl = buildSubscriptionUrl(this.form)
      this.$copyText(this.customSubUrl)
      this.$message.success('订阅链接已生成并复制。')
    },
    async makeShortUrl() {
      this.loading1 = true

      try {
        const result = await createShortLink(this.app.shortenerEndpoint, this.customSubUrl, this.customShortSubUrl)

        if (result.Code === 1 && result.ShortUrl) {
          let shortUrl = result.ShortUrl

          if (this.app.shortenerEndpoint.startsWith('/')) {
            try {
              const parsed = new URL(shortUrl)
              shortUrl = `${window.location.origin}${parsed.pathname}`
            } catch (error) {
              shortUrl = result.ShortUrl
            }
          }

          this.customShortSubUrl = shortUrl
          this.$copyText(shortUrl)
          this.$message.success('短链接已生成并复制。')
          return
        }

        this.$message.error(`短链接生成失败：${result.Message || '未知错误'}`)
      } catch (error) {
        this.$message.error('短链接生成失败。')
      } finally {
        this.loading1 = false
      }
    },
    async confirmUploadConfig() {
      if (!this.app.configUploadEndpoint) {
        this.$message.error('当前部署未配置模板上传服务。')
        return
      }

      this.loading2 = true

      try {
        const result = await uploadRemoteConfig(this.app.configUploadEndpoint, this.uploadConfig)

        if (result.code === 0 && result.data) {
          this.form.remoteConfig = result.data
          this.$copyText(this.form.remoteConfig)
          this.dialogUploadConfigVisible = false
          this.$message.success('模板已上传并复制链接。')
          return
        }

        this.$message.error(`模板上传失败：${result.msg || '未知错误'}`)
      } catch (error) {
        this.$message.error('模板上传失败。')
      } finally {
        this.loading2 = false
      }
    },
    async confirmLoadConfig() {
      if (!this.loadConfig.trim() || !this.loadConfig.trim().includes('http')) {
        this.$message.error('请输入有效的订阅链接或短链接。')
        return
      }

      this.loading3 = true

      try {
        const resolvedUrl = await resolveImportUrl(this.loadConfig.trim())
        hydrateFormFromUrl(this.form, resolvedUrl)
        this.form.customBackend = this.app.engineBaseUrl
        this.form.remoteConfig = ''
        this.dialogLoadConfigVisible = false
        this.customSubUrl = buildSubscriptionUrl(this.form)
        this.$message.success('链接已成功导入工作区。')
      } catch (error) {
        this.$message.error('导入失败，请检查链接或短链服务的 CORS 策略。')
      } finally {
        this.loading3 = false
      }
    }
  }
}
</script>

<style scoped>
.studio-page {
  max-width: 1240px;
  margin: 0 auto;
  padding: 6px 8px 14px;
  background:
    radial-gradient(1200px 340px at 15% -5%, rgba(60, 170, 130, 0.16), transparent 65%),
    radial-gradient(900px 280px at 95% 0%, rgba(95, 140, 220, 0.12), transparent 62%);
}

.studio-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 20px;
}

.eyebrow {
  margin: 0 0 12px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--accent);
}

.hero-copy h1 {
  margin: 0;
  font-size: 44px;
  line-height: 0.95;
}

.hero-description {
  max-width: 720px;
  margin: 16px 0 0;
  font-size: 16px;
  line-height: 1.7;
  color: var(--text-secondary);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}

.studio-theme-toggle {
  flex-shrink: 0;
}

.studio-grid {
  align-items: stretch;
}

.studio-card {
  height: 100%;
  border-radius: 16px;
  border: 1px solid var(--border);
  backdrop-filter: blur(4px);
  box-shadow: 0 14px 36px rgba(17, 24, 39, 0.06);
}

.card-subtitle {
  margin-top: 6px;
  font-size: 13px;
  color: var(--text-secondary);
}

.studio-form {
  margin-top: 8px;
}

.engine-alert {
  margin-bottom: 18px;
}

.option-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 6px;
}

.action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 28px 0 24px;
}

.dialog-form {
  margin-top: 12px;
}

@media (max-width: 991px) {
  .studio-hero {
    flex-direction: column;
  }

  .hero-copy h1 {
    font-size: 34px;
  }

}

@media (max-width: 767px) {
  .option-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .action-row {
    display: grid;
  }
}
</style>
