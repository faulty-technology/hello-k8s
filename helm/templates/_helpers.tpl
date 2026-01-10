{{/*
Common labels applied to all resources
*/}}
{{- define "generic-app.labels" -}}
app: {{ .Values.name }}
app.kubernetes.io/name: {{ .Values.name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
{{- with .Values.commonLabels }}
{{ toYaml . }}
{{- end }}
{{- end }}

{{/*
Selector labels (subset of labels used for pod selection)
*/}}
{{- define "generic-app.selectorLabels" -}}
app: {{ .Values.name }}
{{- end }}

{{/*
Get the first container's port for service/ingress
*/}}
{{- define "generic-app.primaryPort" -}}
{{- (index .Values.containers 0).port | default 80 }}
{{- end }}
