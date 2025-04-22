window.onload = function () {
  let ganttInstance;

  // 获取新增项目按钮并添加点击事件监听器
  const addProcessButton = document.getElementById("addProcessBtn");
  if (addProcessButton) {
    addProcessButton.addEventListener("click", showAddModal);
  }

  // 创建弹出框元素
  const popup = document.createElement("div");
  let isMouseOnTaskBar = false;
  let isMouseOnPopup = false;

  // 设置弹出框样式
  Object.assign(popup.style, {
    position: "fixed",
    width: "300px",
    backgroundColor: "#f1f1f1",
    border: "1px solid #ccc",
    padding: "20px",
    textAlign: "left",
  });

  // 显示提示框的函数
  function showTooltip(infoList, x, y) {
    // 如果已存在弹出框，先移除
    hideTooltip();

    popup.innerHTML = "";
    popup.id = "popup";
    popup.style.left = x + "px";
    popup.style.top = y - 8 + "px";
    const heading = document.createElement("h4");
    heading.textContent = "工序信息";
    heading.style.margin = "0px";
    popup.appendChild(heading);
    // 定义要显示的字段及其中文标签
    const keys = {
      processName: "工序名称",
      startDate: "开始时间",
      endDate: "结束时间",
      pocessType: "工序类别",
      duration: "时长(小时)"
    };
    // 创建input表单
    const form = document.createElement("form");
    form.id = "popupForm";
    // 工序名称
    const nameLabel = document.createElement("label");
    nameLabel.textContent = keys.processName + ":";
    nameLabel.style.display = "block";
    nameLabel.style.marginTop = "8px";
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = infoList.processName || "";
    nameInput.style.width = "100%";
    nameInput.style.marginBottom = "8px";
    nameInput.id = "popupProjectName";
    form.appendChild(nameLabel);
    form.appendChild(nameInput);
    // 开始时间
    const startLabel = document.createElement("label");
    startLabel.textContent = keys.startDate + ":";
    startLabel.style.display = "block";
    startLabel.style.marginTop = "8px";
    const startInput = document.createElement("input");
    startInput.type = "datetime-local";
    startInput.style.width = "100%";
    startInput.style.marginBottom = "8px";
    startInput.id = "popupStartDate";
    // 格式转换: "2024-07-26 12:30" => "2024-07-26T12:30"
    if (infoList.startDate) {
      startInput.value = infoList.startDate.replace(" ", "T");
    }
    form.appendChild(startLabel);
    form.appendChild(startInput);
    // 结束时间
    const endLabel = document.createElement("label");
    endLabel.textContent = keys.endDate + ":";
    endLabel.style.display = "block";
    endLabel.style.marginTop = "8px";
    const endInput = document.createElement("input");
    endInput.type = "datetime-local";
    endInput.style.width = "100%";
    endInput.style.marginBottom = "8px";
    endInput.id = "popupEndDate";
    if (infoList.endDate) {
      endInput.value = infoList.endDate.replace(" ", "T");
    }
    form.appendChild(endLabel);
    form.appendChild(endInput);

    // 工序类别
    const typeLabel = document.createElement("label");
    typeLabel.textContent = keys.pocessType + ":";
    typeLabel.style.display = "block";
    typeLabel.style.marginTop = "8px";
    const typeSelect = document.createElement("select");
    typeSelect.style.width = "100%";
    typeSelect.style.padding = "6px";
    typeSelect.style.marginBottom = "8px";
    typeSelect.style.border = "1px solid #ccc";
    typeSelect.style.boxSizing = "border-box";
    typeSelect.id = "popuppocessType";
    // 添加选项
    const optionPlan = document.createElement("option");
    optionPlan.value = "计划工序";
    optionPlan.textContent = "计划工序";
    const optionActual = document.createElement("option");
    optionActual.value = "实绩工序";
    optionActual.textContent = "实绩工序";
    typeSelect.appendChild(optionPlan);
    typeSelect.appendChild(optionActual);
    // 设置默认选中
    if (infoList.pocessType) {
      typeSelect.value = infoList.pocessType;
    }
    form.appendChild(typeLabel);
    form.appendChild(typeSelect);
    
    popup.appendChild(form);
    // 按钮容器
    const btnContainer = document.createElement("div");
    btnContainer.style.display = "flex";
    btnContainer.style.justifyContent = "flex-end";
    btnContainer.style.marginTop = "16px";
    btnContainer.style.gap = "10px";
    // 保存按钮
    const saveBtn = document.createElement("button");
    saveBtn.textContent = "保存";
    saveBtn.type = "button";
    saveBtn.style.padding = "6px 16px";
    saveBtn.style.backgroundColor = "#63bb5c";
    saveBtn.style.color = "#fff";
    saveBtn.style.border = "none";
    saveBtn.style.borderRadius = "4px";
    saveBtn.style.cursor = "pointer";
    saveBtn.onclick = function () {
      // 获取表单值
      const newName = nameInput.value;
      const newStart = startInput.value.replace("T", " ");
      const newEnd = endInput.value.replace("T", " ");
      const newType = typeSelect.value;

      // 在保存时计算时长
      let calculatedDuration = null;
      if (startInput.value && endInput.value) {
        const start = new Date(startInput.value);
        const end = new Date(endInput.value);
        if (!isNaN(start) && !isNaN(end) && end >= start) {
          calculatedDuration = ((end - start) / (1000 * 60 * 60)).toFixed(1);
        }
      }

      // 直接修改传入的 taskRecord (即 infoList)
      infoList.processName = newName;
      infoList.startDate = newStart;
      infoList.endDate = newEnd;
      infoList.pocessType = newType;
      infoList.duration = calculatedDuration; // 使用计算出的时长
      // 更新甘特图时，使用当前的 window.records 数据源
      if (window.ganttInstance && window.ganttInstance.setRecords) {
        // 这里是关键修改：使用 window.records 而不是旧的 records
        window.ganttInstance.setRecords(window.records);
      }
      alert("保存成功！");
      hideTooltip();
    };
    // 取消按钮
    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "取消";
    cancelBtn.type = "button";
    cancelBtn.style.padding = "6px 16px";
    cancelBtn.style.backgroundColor = "#ccc";
    cancelBtn.style.color = "#333";
    cancelBtn.style.border = "none";
    cancelBtn.style.borderRadius = "4px";
    cancelBtn.style.cursor = "pointer";
    cancelBtn.onclick = function () {
      hideTooltip();
    };
    btnContainer.appendChild(saveBtn);
    btnContainer.appendChild(cancelBtn);
    popup.appendChild(btnContainer);

    document.body.appendChild(popup);

    // 添加一次性点击外部区域隐藏的监听器
    // 使用 setTimeout 确保当前点击事件处理完毕后再添加监听器
    setTimeout(() => {
      document.addEventListener("click", handleClickOutside, {
        capture: true,
        once: true,
      });
    }, 0);
  }

  // 隐藏提示框的函数
  function hideTooltip() {
    if (document.body.contains(popup)) {
      document.body.removeChild(popup);
    }
    // 移除可能存在的外部点击监听器，防止内存泄漏
    document.removeEventListener("click", handleClickOutside, {
      capture: true,
    });
  }

  // 处理点击外部区域的函数
  function handleClickOutside(event) {
    // 检查点击事件的目标是否在 popup 内部
    if (popup && !popup.contains(event.target)) {
      hideTooltip();
    }
  }

  // 自定义工序条布局函数
  const customLayout = (args) => {
    const { width, height, taskRecord } = args;
    const container = new VTableGantt.VRender.Group({
      width,
      height,
      cornerRadius: 10,
      fill: "#f0943a",
      display: "flex",
      flexDirection: "row",
      flexWrap: "nowrap",
      alignItems: "center",
      boundsPadding: 10,
    });
    const name = new VTableGantt.VRender.Text({
      text: taskRecord.processName,
      fill: taskRecord?.keyNode ? "#fff" : "#0f2819",
      suffixPosition: "end",
      fontSize: 14,
      boundsPadding: 10,
    });
    container.add(name);

    // 添加 click 事件监听器
    container.addEventListener("click", (event) => {
      // 阻止事件冒泡，防止触发 handleClickOutside
      event.stopPropagation();
      const containerElement = document.getElementById("tableContainer");
      const containerRect = containerElement.getBoundingClientRect();
      const targetY = event.target.globalAABBBounds.y2;
      // 使用 event.client.x 和计算出的 Y 坐标显示 tooltip
      showTooltip(taskRecord, event.client.x, targetY + containerRect.top);
    });

    return {
      rootContainer: container,
    };
  };

  // 数据
  const records = [
    {
      id: 1,
      processName: "安全交底三方确认停机挂牌",
      pocessType: "实绩工序",
      developer: "liufangfang.jane@bytedance.com",
      startDate: "2025-04-16 12:30",
      endDate: "2025-04-21 12:30",
      duration: "5.0",
      priority: "P0",
    },
    {
      id: 2,
      processName: "安全交底三方确认停机挂牌",
      pocessType: "计划工序",
      developer: "liufangfang.jane@bytedance.com",
      startDate: "2025-04-16 12:30",
      endDate: "2025-04-21 12:30",
      duration: "5.0",
      priority: "P0",
    },
    {
      id: 3,
      processName: "本体介质软曾电缆烧嘴拆除",
      pocessType: "实绩工序",
      developer: "liufangfang.jane@bytedance.com",
      startDate: "2025-04-02 12:30",
      endDate: "2025-04-23 12:30",
      duration: "16.0",
      priority: "P0",
    },
    {
      id: 4,
      processName: "本体介质软曾电缆烧嘴拆除",
      pocessType: "计划工序",
      developer: "liufangfang.jane@bytedance.com",
      startDate: "2025-04-02 12:30",
      endDate: "2025-04-23 12:30",
      duration: "16.0",
      priority: "P0",
    },
    {
      id: 5,
      processName: "水平定尺杆、浮动气缸拆除",
      pocessType: "实绩工序",
      developer: "liufangfang.jane@bytedance.com",
      startDate: "2025-03-16 12:30",
      endDate: "2025-04-16 12:30",
      duration: "16.0",
      priority: "P1",
    },
    {
      id: 6,
      processName: "水平定尺杆、浮动气缸拆除",
      pocessType: "计划工序",
      developer: "liufangfang.jane@bytedance.com",
      startDate: "2025-03-16 12:30",
      endDate: "2025-04-16 12:30",
      duration: "16.0",
      priority: "P1",
    },
    {
      id: 7,
      processName: "高压水管拆除、地沟盖板吊出",
      pocessType: "实绩工序",
      developer: "liufangfang.jane@bytedance.com",
      startDate: "2025-04-16 12:30",
      endDate: "2025-05-16 12:30",
      duration: "16.0",
      priority: "P0",
    },
    {
      id: 8,
      processName: "高压水管拆除、地沟盖板吊出",
      pocessType: "计划工序",
      developer: "liufangfang.jane@bytedance.com",
      startDate: "2025-04-16 12:30",
      endDate: "2025-05-16 12:30",
      duration: "16.0",
      priority: "P0",
    },
    {
      id: 9,
      processName: "火清机本体移出密朗室",
      pocessType: "实绩工序",
      developer: "liufangfang.jane@bytedance.com",
      startDate: "2025-04-15 12:30",
      endDate: "2025-04-29 12:30",
      duration: "16.0",
      priority: "P0",
    },
    {
      id: 10,
      processName: "火清机本体移出密朗室",
      pocessType: "计划工序",
      developer: "liufangfang.jane@bytedance.com",
      startDate: "2025-04-15 12:30",
      endDate: "2025-04-29 12:30",
      duration: "16.0",
      priority: "P0",
    },
    {
      id: 11,
      processName: "火清机本体解体昂出外运",
      pocessType: "实绩工序",
      developer: "liufangfang.jane@bytedance.com",
      startDate: "2025-04-16 12:30",
      endDate: "2025-04-16 12:30",
      duration: "1.0",
      priority: "P1",
    },
    {
      id: 12,
      processName: "火清机本体解体昂出外运",
      pocessType: "计划工序",
      developer: "liufangfang.jane@bytedance.com",
      startDate: "2025-04-16 12:30",
      endDate: "2025-04-16 12:30",
      duration: "1.0",
      priority: "P1",
    },
  ];

  // 列结构
  const columns = [
    {
      field: "processName",
      title: "工序名称",
      width: "auto",
      sort: false,
      mergeCell: true,
    },
    {
      field: "pocessType",
      title: "工序类别",
      width: "auto",
      sort: false,
      style: {
        // 添加样式配置
        textAlign: "center",
      },
    },
    {
      field: "duration",
      title: "时长(小时)",
      width: "auto",
      sort: false,
      style: {
        // 添加样式配置
        textAlign: "center",
      },
    },
  ];

  // 工序条表头星期
  const scalesWeek = [
    {
      unit: "week", // 按周显示
      step: 1, // 步长为1周
      startOfWeek: "monday", // 从周一开始
      format(date) {
        // 获取当前格子的开始日期
        let curDate;
        if (typeof date.startDate === "string") {
          // 尝试解析 YYYY-MM-DD HH:MM 或 YYYY/MM/DD HH:MM 格式
          const normalizedDateString = date.startDate.replace(/-/g, "/");
          const parts = normalizedDateString.split(" ");
          if (parts.length === 2) {
            const dateParts = parts[0].split("/");
            const timeParts = parts[1].split(":");
            if (dateParts.length === 3 && timeParts.length >= 2) {
              // 月份需要减1，因为Date对象月份是0-11
              curDate = new Date(
                parseInt(dateParts[0]),
                parseInt(dateParts[1]) - 1,
                parseInt(dateParts[2]),
                parseInt(timeParts[0]),
                parseInt(timeParts[1])
              );
            } else {
              // 尝试解析日期部分
              curDate = new Date(parts[0]);
            }
          } else {
            // 尝试直接解析整个字符串
            curDate = new Date(normalizedDateString);
          }
        } else if (date.startDate instanceof Date) {
          curDate = date.startDate;
        } else {
          // 对于其他可能的输入，尝试直接创建Date对象
          curDate = new Date(date.startDate);
        }

        // 检查 curDate 是否有效
        if (isNaN(curDate.getTime())) {
          console.error("Invalid date:", date.startDate);
          return "无效日期"; // 或者返回其他错误提示
        }

        // Calculate week index based on the first Monday of the month
        const year = curDate.getFullYear();
        const month = curDate.getMonth(); // 0-11

        const firstOfMonth = new Date(year, month, 1);
        const firstDayOfWeek = firstOfMonth.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

        // Calculate the date of the first Monday
        // If first day is Monday (1), add 0 days.
        // If first day is Sunday (0), add 1 day.
        // Otherwise (Tue-Sat), add (8 - firstDayOfWeek) days.
        const diffToFirstMonday =
          firstDayOfWeek === 1
            ? 0
            : firstDayOfWeek === 0
            ? 1
            : 8 - firstDayOfWeek;
        const firstMondayDate = new Date(firstOfMonth);
        firstMondayDate.setDate(firstOfMonth.getDate() + diffToFirstMonday);

        let weekIndex;
        // Use UTC comparison to avoid DST issues
        const utcCurDateOnly = Date.UTC(year, month, curDate.getDate());
        const utcFirstMondayOnly = Date.UTC(
          firstMondayDate.getFullYear(),
          firstMondayDate.getMonth(),
          firstMondayDate.getDate()
        );

        if (utcCurDateOnly < utcFirstMondayOnly) {
          // Dates before the first Monday belong to week 1
          weekIndex = 1;
        } else {
          // Calculate difference in days from the first Monday
          const dayDiff =
            (utcCurDateOnly - utcFirstMondayOnly) / (1000 * 60 * 60 * 24);
          // Add 1 because the week containing the first Monday is week 1
          weekIndex = Math.floor(dayDiff / 7) + 1;
        }

        return `第${weekIndex}周`;
      },
      style: {
        fontSize: 20,
        fontWeight: "bold",
        color: "white",
        strokeColor: "black",
        textAlign: "right",
        textBaseline: "bottom",
        backgroundColor: "#EEF1F5",
        textStick: true,
        // padding: [0, 30, 0, 20]
      },
    },
    {
      unit: "day",
      step: 1,
      format(date) {
        return date.dateIndex.toString();
      },
      style: {
        fontSize: 20,
        fontWeight: "bold",
        color: "white",
        strokeColor: "black",
        textAlign: "right",
        textBaseline: "bottom",
        backgroundColor: "#EEF1F5",
      },
    },
  ];

  // 工序条表头
  const scalesDay = [
    {
      unit: "day",
      step: 1,
      format(date) {
        // 假设 date 是一个 Date 对象或包含 Date 对象的属性
        // 尝试从 date.startDate 获取 Date 对象
        let currentDate =
          date.startDate instanceof Date
            ? date.startDate
            : new Date(date.startDate);

        // 如果直接从 date 获取失败，尝试从 date 对象本身获取
        if (isNaN(currentDate.getTime()) && date instanceof Date) {
          currentDate = date;
        }

        // 检查日期是否有效
        if (isNaN(currentDate.getTime())) {
          console.error("Invalid date object in scalesDay format:", date);
          // 提供一个回退或错误指示
          // 尝试从 VTable 可能提供的其他属性获取
          const year = date.year !== undefined ? date.year : "??";
          const month =
            date.monthIndex !== undefined
              ? (date.monthIndex + 1).toString().padStart(2, "0")
              : "??";
          const day =
            date.dateIndex !== undefined
              ? date.dateIndex.toString().padStart(2, "0")
              : "??";
          return `${year}-${month}-${day}`; // 返回原始尝试或错误标记
        }

        // 使用标准 Date 方法格式化日期
        const year = currentDate.getFullYear();
        // 月份是 0-11，所以需要 +1，并补零
        const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
        // 日期补零
        const day = currentDate.getDate().toString().padStart(2, "0");
        return `${year}-${month}-${day}`;
      },
      style: {
        fontSize: 20,
        fontWeight: "bold",
        color: "white",
        strokeColor: "black",
        textAlign: "right",
        textBaseline: "bottom",
        backgroundColor: "#EEF1F5",
      },
    },
    {
      unit: "hour",
      step: 1,
      format(date) {
        // 尝试从 date.startDate 获取 Date 对象
        let currentDate =
          date.startDate instanceof Date
            ? date.startDate
            : new Date(date.startDate);

        // 如果直接从 date 获取失败，尝试从 date 对象本身获取
        if (isNaN(currentDate.getTime()) && date instanceof Date) {
          currentDate = date;
        }

        // 检查日期是否有效
        if (isNaN(currentDate.getTime())) {
          console.error("Invalid date object in scalesDay hour format:", date);
          // 尝试从 VTable 可能提供的其他属性获取小时
          const hour =
            date.hourIndex !== undefined
              ? date.hourIndex.toString().padStart(2, "0")
              : "??";
          return `${hour}-00`; // 提供回退，分钟设为00
        }

        // 使用标准 Date 方法格式化时间
        const hours = currentDate.getHours().toString().padStart(2, "0");
        const minutes = currentDate.getMinutes().toString().padStart(2, "0");
        return `${hours}:${minutes}`;
      },
      style: {
        fontSize: 20,
        fontWeight: "bold",
        color: "white",
        strokeColor: "black",
        textAlign: "right",
        textBaseline: "bottom",
        backgroundColor: "#EEF1F5",
      },
    },
  ];

  const option = {
    overscrollBehavior: "none",
    records,
    taskListTable: {
      columns,
      resize: {
        columnResizeMode: "none",
        //columnResizeType:'all',
      },
      select: {
        disableSelect: true,
      },
      // 左边表格宽度
      tableWidth: "auto",
      minTableWidth: 100,
      maxTableWidth: 600,
      theme: {
        // headerStyle
        headerStyle: {
          borderColor: "#e1e4e8",
          borderLineWidth: 1,
          fontSize: 18,
          fontWeight: "bold",
          color: "red",
          bgColor: "#EEF1F5",
        },
        // 表格主体样式
        bodyStyle: {
          borderColor: "#e1e4e8",
          // 边框宽度(上右下左)
          borderLineWidth: [1, 1, 1, 1],
          fontSize: 16,
          color: "#4D4D4D",
          bgColor: "#FFF",
        },
      },
      //rightFrozenColCount: 1
    },
    // 框架样式配置
    frame: {
      // 外框样式
      outerFrameStyle: {
        borderLineWidth: 2,
        borderColor: "#e1e4e8",
        // 圆角半径
        cornerRadius: 8,
      },
      verticalSplitLine: {
        lineColor: "#e1e4e8",
        lineWidth: 3,
      },
      horizontalSplitLine: {
        lineColor: "#e1e4e8",
        lineWidth: 3,
      },
      // 设置表格和工序条分割线不允许拖拽
      verticalSplitLineMoveable: false,
      verticalSplitLineHighlight: {
        lineColor: "green",
        lineWidth: 3,
      },
    },
    // 网格线配置
    grid: {
      verticalLine: {
        lineWidth: 1,
        lineColor: "#e1e4e8",
      },
      horizontalLine: {
        lineWidth: 1,
        lineColor: "#e1e4e8",
      },
    },
    // 行高配置
    headerRowHeight: 40, // 表头行高
    rowHeight: 40, // 数据行高
    // 工序条配置
    taskBar: {
      startDateField: "startDate", // 开始时间字段
      endDateField: "endDate", // 结束时间字段
      // progressField: "progress", // 进度字段
      resizable: false, // 允许调整大小
      moveable: false, // 允许移动
      hoverBarStyle: {
        // 悬停样式
        barOverlayColor: "rgba(99, 144, 0, 0.4)",
      },
      // 工序条样式
      barStyle: {
        width: 20,
        /** 工序条的颜色 */
        // barColor: "#d97c01",
        /** 已完成部分工序条的颜色 */
        // completedBarColor: "#91e8e0",
        /** 工序条的圆角 */
        cornerRadius: 8,
        /** 工序条的边框 */
        borderLineWidth: 0,
        /** 边框颜色 */
        borderColor: "black",
      },
      customLayout,
    },
    // 时间轴头部配置
    timelineHeader: {
      colWidth: 80, // 列宽
      backgroundColor: "#EEF1F5", // 背景色
      horizontalLine: {
        lineWidth: 1,
        lineColor: "#e1e4e8",
      },
      verticalLine: {
        lineWidth: 1,
        lineColor: "#e1e4e8",
      },
      // 时间刻度配置
      scales: scalesDay,
    },
    // 标记线配置
    markLine: [
      {
        date: "2025-04-16", // 标记日期，记录当前日期
        scrollToMarkLine: true, // 自动滚动到标记线
        position: "left", // 位置
        style: {
          // 样式
          lineColor: "red",
          lineWidth: 1,
        },
      },
    ],
    // 行序号配置
    rowSeriesNumber: {
      title: "序号", // 标题
      dragOrder: true, // 允许拖拽排序
      // cellType: "checkbox", // 单元格类型
      width: 70,
      headerStyle: {
        bgColor: "#EEF1F5",
        borderColor: "#e1e4e8",
      },
      style: {
        borderColor: "#e1e4e8",
      },
    },
    // 滚动条样式
    scrollStyle: {
      scrollRailColor: "RGBA(246,246,246,0.5)", // 轨道颜色
      visible: "scrolling", // 滚动时显示
      width: 6, // 宽度
      scrollSliderCornerRadius: 2, // 滑块圆角
      scrollSliderColor: "#009b00", // 滑块颜色
    },
  };
  // 创建甘特图实例
  ganttInstance = new VTableGantt.Gantt(
    document.getElementById("tableContainer"), // 容器元素
    option // 配置选项
  );

  // --- Add check here ---
  if (ganttInstance) {
    // 将实例挂载到window方便调试
    window["ganttInstance"] = ganttInstance;
    // 将 records 也挂载到 window，以便在 saveNewProcess 中访问
    window.records = records;
  } else {
    console.error("Failed to create Gantt instance!");
    alert("甘特图初始化失败，请检查控制台错误信息。");
    // Optionally return or disable functionality if instance creation fails
    return; // Exit onload if instance fails
  }
  // --- End of added check ---

  // --- Context Menu Logic Start ---
  let taskContextMenu = null; // Variable to hold the context menu element
  let recordToDeleteId = null; // Variable to store the ID of the record to delete

  // Function to create or get the context menu
  function getOrCreateContextMenu() {
    if (!taskContextMenu) {
      taskContextMenu = document.createElement("div");
      taskContextMenu.id = "taskContextMenu";
      taskContextMenu.style.position = "fixed";
      taskContextMenu.style.display = "none"; // Hidden by default
      taskContextMenu.style.backgroundColor = "white";
      taskContextMenu.style.border = "1px solid #ccc";
      taskContextMenu.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
      taskContextMenu.style.padding = "5px 0";
      taskContextMenu.style.zIndex = "1001"; // Ensure it's above other elements

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "删除工序";
      deleteButton.style.display = "block";
      deleteButton.style.width = "100%";
      deleteButton.style.padding = "5px 15px";
      deleteButton.style.border = "none";
      deleteButton.style.backgroundColor = "transparent";
      deleteButton.style.textAlign = "left";
      deleteButton.style.cursor = "pointer";

      deleteButton.addEventListener("mouseenter", () => {
        deleteButton.style.backgroundColor = "#f0f0f0";
      });
      deleteButton.addEventListener("mouseleave", () => {
        deleteButton.style.backgroundColor = "transparent";
      });

      deleteButton.addEventListener("click", () => {
        if (recordToDeleteId !== null) {
          if (confirm("确定要删除这个工序吗？")) {
            // Filter out the record
            const currentRecords = window.records || [];
            const newRecords = currentRecords.filter(
              (record) => record.id !== recordToDeleteId
            );

            // Update the Gantt chart data
            if (window.ganttInstance) {
              // Important: Update the global records array as well if you are using it elsewhere
              window.records = newRecords;
              window.ganttInstance.setRecords(newRecords); // Or updateOption
              console.log("工序删除成功");
            } else {
              console.error("无法访问 ganttInstance");
              alert("删除失败，无法访问甘特图实例。");
            }
          }
          recordToDeleteId = null; // Reset the ID
        }
        hideContextMenu(); // Hide menu after action or cancellation
      });

      taskContextMenu.appendChild(deleteButton);
      document.body.appendChild(taskContextMenu);
    }
    return taskContextMenu;
  }

  // Function to hide the context menu
  function hideContextMenu() {
    if (taskContextMenu) {
      taskContextMenu.style.display = "none";
    }
    recordToDeleteId = null; // Clear the ID when hiding
  }

  // Add listener for right-clicking on a task bar
  ganttInstance.on("contextmenu_task_bar", (params) => {
    params.event.preventDefault(); // Prevent default browser context menu

    // 阻止浏览器默认右键菜单
    window.addEventListener("contextmenu", function (e) {
      e.preventDefault();
    });

    if (!params.record || params.record.id === undefined) {
      console.error("无法获取右键点击的工序记录或记录缺少 ID。");
      return;
    }

    recordToDeleteId = params.record.id; // Store the ID of the record to be deleted

    const menu = getOrCreateContextMenu();
    menu.style.left = `${params.event.clientX}px`;
    menu.style.top = `${params.event.clientY}px`;
    menu.style.display = "block";
  });

  // Add global click listener to hide the menu when clicking elsewhere
  document.addEventListener("click", (event) => {
    // Hide if the click is outside the context menu
    if (taskContextMenu && taskContextMenu.style.display === "block") {
      if (!taskContextMenu.contains(event.target)) {
        hideContextMenu();
      }
    }
  });
  // --- Context Menu Logic End ---

  // --- 新增项目功能 Start ---
  const addProcessBtn = document.getElementById("addProcessBtn");
  const addModal = document.getElementById("addModal");
  const addProcessNameInput = document.getElementById("addProcessName");
  const addStartDateInput = document.getElementById("addStartDate");
  const addEndDateInput = document.getElementById("addEndDate");
  const saveNewProcessBtn = document.getElementById("saveNewProcessBtn"); // 获取保存按钮
  const cancelAddModalBtn = document.getElementById("cancelAddModalBtn"); // 获取取消按钮

  if (addProcessBtn) {
    addProcessBtn.addEventListener("click", showAddModal);
  }

  // 为新增模态框的按钮添加事件监听器
  if (saveNewProcessBtn) {
    saveNewProcessBtn.addEventListener("click", saveNewProcess);
  }
  if (cancelAddModalBtn) {
    cancelAddModalBtn.addEventListener("click", closeAddModal);
  }

  // 显示新增项目模态框
  function showAddModal() {
    const modal = document.getElementById("addModal");
    if (modal) {
      modal.style.display = "block";
    }
  }

  // 关闭新增项目模态框
  function closeAddModal() {
    const modal = document.getElementById("addModal");
    if (modal) {
      modal.style.display = "none";
      // 清空输入框（可选）
      document.getElementById("addProcessName").value = "";
      document.getElementById("addStartDate").value = "";
      document.getElementById("addEndDate").value = "";
    }
  }

  // 保存新项目
  function saveNewProcess() {
    const projectName = document.getElementById("addProcessName").value;
    const pocessType = document.getElementById("addProcessType").value; // 获取工序类别
    const startDate = document.getElementById("addStartDate").value;
    const endDate = document.getElementById("addEndDate").value;

    if (!projectName || !startDate || !endDate) {
      alert("请填写所有项目信息！");
      return;
    }

    // 将 datetime-local 格式转换为 VTable-Gantt 需要的格式 (YYYY-MM-DD HH:MM)
    const formattedStartDate = startDate.replace("T", " ");
    const formattedEndDate = endDate.replace("T", " ");

    // 创建新项目对象 (注意：这里的 id 和 parentId 需要根据实际逻辑生成或设置)
    const newProject = {
      id: Date.now().toString(), // 临时使用时间戳作为 ID
      processName: projectName,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      pocessType: pocessType, // 使用从下拉框获取的值
      developer: "默认开发者", // 默认值
      priority: "P0", // 默认优先级
      // parentId: null, // 根据需要设置父工序ID
      // progress: 0 // 默认进度
    };

    // 将新项目添加到数据源 (假设 records 是全局或可访问的数据源)
    // 注意：需要确保 records 变量在此处可用
    if (window.records && window.ganttInstance) {
      window.records.push(newProject);
      window.ganttInstance.setRecords(window.records); // 更新甘特图
      alert("项目添加成功！");
      closeAddModal(); // 关闭模态框
    } else {
      console.error("无法访问 records 或 ganttInstance。");
      alert("添加项目失败，请检查控制台。");
    }
  }

  // 将 records 挂载到 window 以便在 saveNewProcess 中访问
  window.records = records;
};
