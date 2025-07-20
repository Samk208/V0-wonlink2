// Add these translation keys to your lib/translations.ts file
// Following Wonlink's i18n pattern

export const translations = {
  en: {
    // ... existing translations ...
    
    // Import/Export Page Headers
    "importExport.title": "Product Import/Export",
    "importExport.subtitle": "Manage your product catalogs and campaign data efficiently",
    
    // Import Section
    "import.title": "Import Products",
    "import.dropZone.idle": "Drop your CSV, Excel, or JSON file here",
    "import.dropZone.uploading": "Uploading...",
    "import.dropZone.processing": "Processing data and validating...",
    "import.dropZone.complete": "Import completed successfully!",
    "import.dropZone.error": "Error: Please check file format and try again",
    "import.dropZone.formats": "Supports CSV, Excel (.xlsx), and JSON formats",
    "import.chooseFile": "Choose File",
    "import.requiredColumns": "Required Columns:",
    "import.column.productName": "Product Name",
    "import.column.price": "Price",
    "import.column.category": "Category", 
    "import.column.description": "Description",
    "import.column.required": "Required",
    "import.column.optional": "Optional",
    
    // Export Section
    "export.title": "Export Data",
    "export.productCatalog.title": "Product Catalog",
    "export.productCatalog.description": "Export all products with pricing, categories, and metadata",
    "export.campaignData.title": "Campaign Data", 
    "export.campaignData.description": "Export campaign performance metrics and ROI data",
    "export.analytics.title": "Analytics Report",
    "export.analytics.description": "Export detailed analytics and performance insights",
    "export.button.csv": "Export CSV",
    "export.button.excel": "Export Excel", 
    "export.button.pdf": "Export PDF",
    
    // Recent Imports
    "recent.title": "Recent Imports",
    "recent.records": "records",
    "recent.status.completed": "completed",
    "recent.status.processing": "processing", 
    "recent.status.error": "error",
    "recent.viewDetails": "View Details",
    
    // Time expressions
    "time.hoursAgo": "小时前",
    "time.dayAgo": "天前",
    "time.daysAgo": "天前"
  }
};

// Usage example in components:
// const { t } = useTranslation();
// <h1>{t('importExport.title')}</h1>

// File processing specific translations for error handling:
export const fileProcessingTranslations = {
  en: {
    "file.validation.invalidFormat": "Invalid file format. Please use CSV, Excel, or JSON.",
    "file.validation.tooLarge": "File is too large. Maximum size is 10MB.",
    "file.validation.empty": "File is empty. Please select a file with data.",
    "file.validation.missingColumns": "Missing required columns: {columns}",
    "file.validation.invalidData": "Invalid data in row {row}: {error}",
    "file.processing.started": "File processing started",
    "file.processing.progress": "Processing {current} of {total} records",
    "file.processing.completed": "Successfully processed {count} records",
    "file.processing.failed": "Processing failed: {error}",
    "file.upload.success": "File uploaded successfully",
    "file.upload.failed": "Upload failed: {error}",
    "file.download.preparing": "Preparing download...",
    "file.download.ready": "Download ready",
    "file.template.download": "Download Template"
  },
  
  ko: {
    "file.validation.invalidFormat": "잘못된 파일 형식입니다. CSV, Excel 또는 JSON을 사용해주세요.",
    "file.validation.tooLarge": "파일이 너무 큽니다. 최대 크기는 10MB입니다.",
    "file.validation.empty": "파일이 비어있습니다. 데이터가 있는 파일을 선택해주세요.",
    "file.validation.missingColumns": "필수 열이 누락되었습니다: {columns}",
    "file.validation.invalidData": "{row}행에 잘못된 데이터가 있습니다: {error}",
    "file.processing.started": "파일 처리가 시작되었습니다",
    "file.processing.progress": "{total}개 중 {current}개 레코드 처리 중",
    "file.processing.completed": "{count}개 레코드를 성공적으로 처리했습니다",
    "file.processing.failed": "처리 실패: {error}",
    "file.upload.success": "파일이 성공적으로 업로드되었습니다",
    "file.upload.failed": "업로드 실패: {error}",
    "file.download.preparing": "다운로드 준비 중...",
    "file.download.ready": "다운로드 준비 완료",
    "file.template.download": "템플릿 다운로드"
  },
  
  zh: {
    "file.validation.invalidFormat": "文件格式无效。请使用CSV、Excel或JSON格式。",
    "file.validation.tooLarge": "文件过大。最大大小为10MB。",
    "file.validation.empty": "文件为空。请选择包含数据的文件。",
    "file.validation.missingColumns": "缺少必需列：{columns}",
    "file.validation.invalidData": "第{row}行数据无效：{error}",
    "file.processing.started": "文件处理已开始",
    "file.processing.progress": "正在处理第{current}/{total}条记录",
    "file.processing.completed": "成功处理了{count}条记录",
    "file.processing.failed": "处理失败：{error}",
    "file.upload.success": "文件上传成功",
    "file.upload.failed": "上传失败：{error}",
    "file.download.preparing": "正在准备下载...",
    "file.download.ready": "下载已准备就绪",
    "file.template.download": "下载模板"
  }
};

// Product-specific translations for Wonlink platform:
export const productTranslations = {
  en: {
    "product.fields.name": "Product Name",
    "product.fields.description": "Description", 
    "product.fields.price": "Price",
    "product.fields.category": "Category",
    "product.fields.brand": "Brand",
    "product.fields.sku": "SKU",
    "product.fields.imageUrl": "Image URL",
    "product.fields.tags": "Tags",
    "product.fields.availability": "Availability",
    "product.fields.commission": "Commission Rate",
    "product.categories.fashion": "Fashion",
    "product.categories.beauty": "Beauty",
    "product.categories.tech": "Technology",
    "product.categories.lifestyle": "Lifestyle",
    "product.categories.fitness": "Fitness",
    "product.categories.food": "Food & Beverage",
    "product.status.active": "Active",
    "product.status.inactive": "Inactive",
    "product.status.pending": "Pending Review"
  },
  
  ko: {
    "product.fields.name": "제품명",
    "product.fields.description": "설명",
    "product.fields.price": "가격", 
    "product.fields.category": "카테고리",
    "product.fields.brand": "브랜드",
    "product.fields.sku": "SKU",
    "product.fields.imageUrl": "이미지 URL",
    "product.fields.tags": "태그",
    "product.fields.availability": "재고 상태",
    "product.fields.commission": "수수료율",
    "product.categories.fashion": "패션",
    "product.categories.beauty": "뷰티",
    "product.categories.tech": "기술",
    "product.categories.lifestyle": "라이프스타일",
    "product.categories.fitness": "피트니스",
    "product.categories.food": "식음료",
    "product.status.active": "활성",
    "product.status.inactive": "비활성",
    "product.status.pending": "검토 대기"
  },
  
  zh: {
    "product.fields.name": "产品名称",
    "product.fields.description": "描述",
    "product.fields.price": "价格",
    "product.fields.category": "类别",
    "product.fields.brand": "品牌", 
    "product.fields.sku": "SKU",
    "product.fields.imageUrl": "图片URL",
    "product.fields.tags": "标签",
    "product.fields.availability": "库存状态",
    "product.fields.commission": "佣金率",
    "product.categories.fashion": "时尚",
    "product.categories.beauty": "美妆",
    "product.categories.tech": "科技",
    "product.categories.lifestyle": "生活方式",
    "product.categories.fitness": "健身",
    "product.categories.food": "食品饮料",
    "product.status.active": "活跃",
    "product.status.inactive": "非活跃",
    "product.status.pending": "待审核"
  }
};time.hoursAgo": "hours ago",
    "time.dayAgo": "day ago",
    "time.daysAgo": "days ago"
  },
  
  ko: {
    // ... existing translations ...
    
    // Import/Export Page Headers
    "importExport.title": "제품 가져오기/내보내기",
    "importExport.subtitle": "제품 카탈로그와 캠페인 데이터를 효율적으로 관리하세요",
    
    // Import Section
    "import.title": "제품 가져오기",
    "import.dropZone.idle": "CSV, Excel 또는 JSON 파일을 여기에 놓으세요",
    "import.dropZone.uploading": "업로드 중...",
    "import.dropZone.processing": "데이터 처리 및 검증 중...",
    "import.dropZone.complete": "가져오기가 성공적으로 완료되었습니다!",
    "import.dropZone.error": "오류: 파일 형식을 확인하고 다시 시도해주세요",
    "import.dropZone.formats": "CSV, Excel (.xlsx), JSON 형식을 지원합니다",
    "import.chooseFile": "파일 선택",
    "import.requiredColumns": "필수 열:",
    "import.column.productName": "제품명",
    "import.column.price": "가격",
    "import.column.category": "카테고리",
    "import.column.description": "설명",
    "import.column.required": "필수",
    "import.column.optional": "선택사항",
    
    // Export Section  
    "export.title": "데이터 내보내기",
    "export.productCatalog.title": "제품 카탈로그",
    "export.productCatalog.description": "가격, 카테고리, 메타데이터가 포함된 모든 제품을 내보냅니다",
    "export.campaignData.title": "캠페인 데이터",
    "export.campaignData.description": "캠페인 성과 지표와 ROI 데이터를 내보냅니다",
    "export.analytics.title": "분석 보고서",
    "export.analytics.description": "상세한 분석 및 성과 인사이트를 내보냅니다",
    "export.button.csv": "CSV 내보내기",
    "export.button.excel": "Excel 내보내기",
    "export.button.pdf": "PDF 내보내기",
    
    // Recent Imports
    "recent.title": "최근 가져오기",
    "recent.records": "개 레코드",
    "recent.status.completed": "완료됨",
    "recent.status.processing": "처리 중",
    "recent.status.error": "오류",
    "recent.viewDetails": "세부정보 보기",
    
    // Time expressions
    "time.hoursAgo": "시간 전",
    "time.dayAgo": "일 전", 
    "time.daysAgo": "일 전"
  },
  
  zh: {
    // ... existing translations ...
    
    // Import/Export Page Headers
    "importExport.title": "产品导入/导出",
    "importExport.subtitle": "高效管理您的产品目录和营销活动数据",
    
    // Import Section
    "import.title": "导入产品",
    "import.dropZone.idle": "将您的CSV、Excel或JSON文件拖放到这里",
    "import.dropZone.uploading": "上传中...",
    "import.dropZone.processing": "正在处理数据并验证...",
    "import.dropZone.complete": "导入成功完成！",
    "import.dropZone.error": "错误：请检查文件格式并重试",
    "import.dropZone.formats": "支持CSV、Excel (.xlsx)和JSON格式",
    "import.chooseFile": "选择文件",
    "import.requiredColumns": "必需列：",
    "import.column.productName": "产品名称", 
    "import.column.price": "价格",
    "import.column.category": "类别",
    "import.column.description": "描述",
    "import.column.required": "必需",
    "import.column.optional": "可选",
    
    // Export Section
    "export.title": "导出数据", 
    "export.productCatalog.title": "产品目录",
    "export.productCatalog.description": "导出包含价格、类别和元数据的所有产品",
    "export.campaignData.title": "营销活动数据",
    "export.campaignData.description": "导出营销活动表现指标和投资回报率数据",
    "export.analytics.title": "分析报告",
    "export.analytics.description": "导出详细的分析和表现洞察",
    "export.button.csv": "导出CSV",
    "export.button.excel": "导出Excel",
    "export.button.pdf": "导出PDF",
    
    // Recent Imports
    "recent.title": "最近导入",
    "recent.records": "条记录",
    "recent.status.completed": "已完成",
    "recent.status.processing": "处理中",
    "recent.status.error": "错误",
    "recent.viewDetails": "查看详情",
    
    // Time expressions
    "