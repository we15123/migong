document.addEventListener('DOMContentLoaded', function() {
    // 迷宫配置 - 增加难度
    const config = {
        // 迷宫尺寸（列数和行数）- 增加大小以提高难度
        cols: 35,
        rows: 45,
        cellSize: 0, // 将在初始化时计算
        // 将起点和终点放在更远的位置
        startX: 1,
        startY: 1,
        endX: 33,
        endY: 43
    };

    // 迷宫单元格类型
    const CELL_TYPES = {
        WALL: 'wall',
        PATH: 'path',
        START: 'start',
        END: 'end',
        SOLUTION: 'solution'
    };

    // 方向: 上、右、下、左
    const DIRECTIONS = [
        { x: 0, y: -2 }, // 上
        { x: 2, y: 0 },  // 右
        { x: 0, y: 2 },  // 下
        { x: -2, y: 0 }  // 左
    ];

    // 迷宫数据
    let mazeData = [];
    let solutionPath = [];
    let showingSolution = false;

    // DOM元素
    const mazeElement = document.getElementById('maze');
    const generateBtn = document.getElementById('generate-btn');
    const printBtn = document.getElementById('print-btn');
    const solutionBtn = document.getElementById('solution-btn');
    
    // 添加导出PDF按钮
    const exportPdfBtn = document.createElement('button');
    exportPdfBtn.id = 'export-pdf-btn';
    exportPdfBtn.textContent = '导出PDF';
    document.querySelector('.maze-info').appendChild(exportPdfBtn);

    // 初始化
    function initialize() {
        // 计算单元格大小
        const mazeWidth = mazeElement.offsetWidth;
        const mazeHeight = mazeElement.offsetHeight;
        
        // 确保迷宫比例与配置的行列数比例一致
        config.cellSize = Math.min(
            Math.floor(mazeWidth / config.cols),
            Math.floor(mazeHeight / config.rows)
        );

        // 生成迷宫
        generateMaze();

        // 事件监听
        generateBtn.addEventListener('click', generateMaze);
        printBtn.addEventListener('click', printMaze);
        solutionBtn.addEventListener('click', toggleSolution);
        exportPdfBtn.addEventListener('click', exportPDF);
    }

    // 生成迷宫 - 增加复杂度
    function generateMaze() {
        // 重置迷宫数据
        mazeData = [];
        solutionPath = [];
        showingSolution = false;
        
        // 初始化所有单元格为墙
        for (let y = 0; y < config.rows; y++) {
            mazeData[y] = [];
            for (let x = 0; x < config.cols; x++) {
                mazeData[y][x] = CELL_TYPES.WALL;
            }
        }

        // 使用深度优先搜索算法生成迷宫，增加复杂性
        const stack = [];
        const visited = new Set();
        
        // 从起点开始
        let currentX = config.startX;
        let currentY = config.startY;
        
        mazeData[currentY][currentX] = CELL_TYPES.PATH;
        visited.add(`${currentX},${currentY}`);
        stack.push({ x: currentX, y: currentY });
        
        // 用于创建更多死胡同和复杂路径的偏好方向
        const directionPreference = [0, 1, 2, 3]; // 上、右、下、左
        
        while (stack.length > 0) {
            // 获取当前位置的未访问邻居
            const neighbors = getUnvisitedNeighbors(currentX, currentY, visited);
            
            if (neighbors.length > 0) {
                // 随机洗牌方向偏好以增加迷宫的随机性和复杂度
                shuffleArray(directionPreference);
                
                // 根据洗牌后的方向偏好对邻居进行排序
                neighbors.sort((a, b) => {
                    const dirA = getDirection(currentX, currentY, a.x, a.y);
                    const dirB = getDirection(currentX, currentY, b.x, b.y);
                    return directionPreference.indexOf(dirA) - directionPreference.indexOf(dirB);
                });
                
                // 增加倾向于创建更长路径的逻辑
                let nextIndex = 0;
                // 有20%的概率选择非第一个邻居，增加迷宫的复杂性
                if (neighbors.length > 1 && Math.random() < 0.2) {
                    nextIndex = Math.floor(Math.random() * neighbors.length);
                }
                
                const next = neighbors[nextIndex];
                
                // 移除两个单元格之间的墙
                const wallX = currentX + (next.x - currentX) / 2;
                const wallY = currentY + (next.y - currentY) / 2;
                mazeData[wallY][wallX] = CELL_TYPES.PATH;
                
                // 设置下一个单元格为路径
                mazeData[next.y][next.x] = CELL_TYPES.PATH;
                
                // 标记为已访问并入栈
                visited.add(`${next.x},${next.y}`);
                stack.push(next);
                
                // 更新当前位置
                currentX = next.x;
                currentY = next.y;
            } else if (stack.length > 0) {
                // 回溯
                const position = stack.pop();
                currentX = position.x;
                currentY = position.y;
                
                // 增加复杂性：在回溯过程中，有10%的机会开辟新路径
                if (Math.random() < 0.1) {
                    const allNeighbors = getAllNeighbors(currentX, currentY);
                    for (const neighbor of allNeighbors) {
                        // 只对已经是路径的邻居考虑添加额外连接
                        if (
                            neighbor.x >= 0 && neighbor.x < config.cols &&
                            neighbor.y >= 0 && neighbor.y < config.rows &&
                            mazeData[neighbor.y][neighbor.x] === CELL_TYPES.PATH &&
                            // 确保不是直接相邻的路径（这样会破坏迷宫结构）
                            (Math.abs(neighbor.x - currentX) > 2 || Math.abs(neighbor.y - currentY) > 2)
                        ) {
                            // 创建连接
                            const midX = Math.floor((currentX + neighbor.x) / 2);
                            const midY = Math.floor((currentY + neighbor.y) / 2);
                            
                            // 避免在边界创建连接
                            if (
                                midX > 0 && midX < config.cols - 1 &&
                                midY > 0 && midY < config.rows - 1
                            ) {
                                mazeData[midY][midX] = CELL_TYPES.PATH;
                                break; // 每次只添加一个额外连接
                            }
                        }
                    }
                }
            }
        }
        
        // 设置起点和终点
        mazeData[config.startY][config.startX] = CELL_TYPES.START;
        mazeData[config.endY][config.endX] = CELL_TYPES.END;
        
        // 寻找从起点到终点的路径
        findSolution();
        
        // 增加难度：创建虚假路径和更多死胡同
        createFalsePaths();
        
        // 渲染迷宫
        renderMaze();
        
        // 重置按钮文本
        solutionBtn.textContent = '显示答案';
    }
    
    // 获取两点之间的方向索引 (0:上, 1:右, 2:下, 3:左)
    function getDirection(fromX, fromY, toX, toY) {
        if (fromY > toY) return 0; // 上
        if (fromX < toX) return 1; // 右
        if (fromY < toY) return 2; // 下
        return 3; // 左
    }
    
    // 获取指定位置的所有可能邻居，不考虑是否已访问
    function getAllNeighbors(x, y) {
        const neighbors = [];
        for (let dx = -2; dx <= 2; dx += 2) {
            for (let dy = -2; dy <= 2; dy += 2) {
                // 避免对角线和自身
                if ((dx === 0) !== (dy === 0)) {
                    neighbors.push({ x: x + dx, y: y + dy });
                }
            }
        }
        return neighbors;
    }
    
    // 打乱数组（Fisher-Yates洗牌算法）
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // 创建虚假路径和死胡同，使迷宫更复杂
    function createFalsePaths() {
        // 找到所有可能的墙点
        const walls = [];
        for (let y = 1; y < config.rows - 1; y++) {
            for (let x = 1; x < config.cols - 1; x++) {
                if (mazeData[y][x] === CELL_TYPES.WALL) {
                    // 检查周围路径的数量
                    let pathCount = 0;
                    if (mazeData[y - 1][x] === CELL_TYPES.PATH) pathCount++;
                    if (mazeData[y + 1][x] === CELL_TYPES.PATH) pathCount++;
                    if (mazeData[y][x - 1] === CELL_TYPES.PATH) pathCount++;
                    if (mazeData[y][x + 1] === CELL_TYPES.PATH) pathCount++;
                    
                    // 只有在周围有一个路径的情况下添加死胡同
                    if (pathCount === 1) {
                        walls.push({ x, y });
                    }
                }
            }
        }
        
        // 随机选择一些墙转换为路径，创建死胡同
        const falsePaths = Math.floor(walls.length * 0.1); // 添加10%的虚假路径
        
        shuffleArray(walls);
        
        for (let i = 0; i < falsePaths && i < walls.length; i++) {
            const wall = walls[i];
            mazeData[wall.y][wall.x] = CELL_TYPES.PATH;
        }
    }

    // 获取未访问的邻居
    function getUnvisitedNeighbors(x, y, visited) {
        const neighbors = [];
        
        // 检查四个方向
        for (const dir of DIRECTIONS) {
            const newX = x + dir.x;
            const newY = y + dir.y;
            
            // 检查是否在边界内且未访问
            if (
                newX > 0 && newX < config.cols - 1 &&
                newY > 0 && newY < config.rows - 1 &&
                !visited.has(`${newX},${newY}`)
            ) {
                neighbors.push({ x: newX, y: newY });
            }
        }
        
        return neighbors;
    }

    // 寻找解决方案路径
    function findSolution() {
        const visited = new Set();
        const queue = [];
        const parents = new Map();
        
        // 从起点开始
        queue.push({ x: config.startX, y: config.startY });
        visited.add(`${config.startX},${config.startY}`);
        
        // 广度优先搜索寻找最短路径
        while (queue.length > 0) {
            const current = queue.shift();
            
            // 如果到达终点
            if (current.x === config.endX && current.y === config.endY) {
                // 回溯生成路径
                solutionPath = [];
                let node = current;
                
                while (node) {
                    solutionPath.push(node);
                    node = parents.get(`${node.x},${node.y}`);
                }
                
                solutionPath.reverse();
                break;
            }
            
            // 检查四个方向
            for (const dir of [
                { x: 0, y: -1 }, // 上
                { x: 1, y: 0 },  // 右
                { x: 0, y: 1 },  // 下
                { x: -1, y: 0 }  // 左
            ]) {
                const newX = current.x + dir.x;
                const newY = current.y + dir.y;
                const key = `${newX},${newY}`;
                
                // 检查是否在边界内、未访问且为路径（不是墙）
                if (
                    newX >= 0 && newX < config.cols &&
                    newY >= 0 && newY < config.rows &&
                    !visited.has(key) &&
                    mazeData[newY][newX] !== CELL_TYPES.WALL
                ) {
                    queue.push({ x: newX, y: newY });
                    visited.add(key);
                    parents.set(key, current);
                }
            }
        }
    }

    // 渲染迷宫
    function renderMaze() {
        // 清空迷宫容器
        while (mazeElement.firstChild) {
            mazeElement.removeChild(mazeElement.firstChild);
        }
        
        // 为每个单元格创建DOM元素
        for (let y = 0; y < config.rows; y++) {
            for (let x = 0; x < config.cols; x++) {
                const cellType = mazeData[y][x];
                
                const cell = document.createElement('div');
                cell.className = `cell ${cellType}`;
                cell.style.width = `${config.cellSize}px`;
                cell.style.height = `${config.cellSize}px`;
                cell.style.left = `${x * config.cellSize}px`;
                cell.style.top = `${y * config.cellSize}px`;
                
                mazeElement.appendChild(cell);
            }
        }
    }

    // 切换显示/隐藏解决方案
    function toggleSolution() {
        showingSolution = !showingSolution;
        
        if (showingSolution) {
            solutionBtn.textContent = '隐藏答案';
            
            // 标记解决方案路径
            for (const point of solutionPath) {
                if (
                    !(point.x === config.startX && point.y === config.startY) &&
                    !(point.x === config.endX && point.y === config.endY)
                ) {
                    const cells = mazeElement.querySelectorAll('.cell');
                    const index = point.y * config.cols + point.x;
                    cells[index].classList.add('solution');
                }
            }
        } else {
            solutionBtn.textContent = '显示答案';
            
            // 移除解决方案标记
            const solutionCells = mazeElement.querySelectorAll('.solution');
            solutionCells.forEach(cell => {
                cell.classList.remove('solution');
            });
        }
    }

    // 打印迷宫
    function printMaze() {
        // 确保打印时不显示解决方案
        if (showingSolution) {
            toggleSolution();
        }
        window.print();
    }
    
    // 导出为PDF (完全重写此功能，使用canvas方式)
    function exportPDF() {
        // 确保导出时不显示解决方案
        if (showingSolution) {
            toggleSolution();
        }
        
        // 创建一个新的canvas元素
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 设置canvas尺寸为A4纸大小（210mm × 297mm）转为像素
        // 假设96 DPI (1英寸 = 25.4毫米)
        const dpi = 96;
        const mmToPx = dpi / 25.4;
        
        const width = 210 * mmToPx;
        const height = 297 * mmToPx;
        
        canvas.width = width;
        canvas.height = height;
        
        // 设置背景为白色
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        
        // 绘制标题和说明
        ctx.fillStyle = '#333333';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('迷宫挑战', width / 2, 40);
        
        ctx.font = '16px Arial';
        ctx.fillText('从起点出发，找到通往终点的路径！', width / 2, 70);
        
        // 计算迷宫位置和大小
        const padding = 15 * mmToPx; // 15mm边距
        const mazeWidth = width - (padding * 2);
        const mazeHeight = height - (padding * 3) - 80; // 减去顶部文字和底部留白
        
        const cellWidth = mazeWidth / config.cols;
        const cellHeight = mazeHeight / config.rows;
        
        // 绘制迷宫边框
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeRect(padding, 80, mazeWidth, mazeHeight);
        
        // 绘制单元格
        for (let y = 0; y < config.rows; y++) {
            for (let x = 0; x < config.cols; x++) {
                const cellType = mazeData[y][x];
                const cellX = padding + (x * cellWidth);
                const cellY = 80 + (y * cellHeight);
                
                if (cellType === CELL_TYPES.WALL) {
                    // 绘制墙壁
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(cellX, cellY, cellWidth, cellHeight);
                } else if (cellType === CELL_TYPES.START) {
                    // 绘制起点
                    ctx.fillStyle = '#00a000';
                    ctx.fillRect(cellX, cellY, cellWidth, cellHeight);
                } else if (cellType === CELL_TYPES.END) {
                    // 绘制终点
                    ctx.fillStyle = '#e00000';
                    ctx.fillRect(cellX, cellY, cellWidth, cellHeight);
                }
                // 路径单元格保持白色背景
            }
        }
        
        // 绘制图例
        const legendY = 80 + mazeHeight + 20;
        
        // 起点图例
        ctx.fillStyle = '#00a000';
        ctx.fillRect(padding, legendY, 20, 20);
        ctx.fillStyle = '#333333';
        ctx.textAlign = 'left';
        ctx.font = '16px Arial';
        ctx.fillText('起点', padding + 30, legendY + 15);
        
        // 终点图例
        ctx.fillStyle = '#e00000';
        ctx.fillRect(padding + 100, legendY, 20, 20);
        ctx.fillStyle = '#333333';
        ctx.fillText('终点', padding + 130, legendY + 15);
        
        // 页脚
        ctx.textAlign = 'center';
        ctx.fillText('祝你玩得开心！', width / 2, height - 20);
        
        // 添加当前日期
        const date = new Date();
        const dateStr = date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate() + ' ' + 
                      date.getHours() + ':' + date.getMinutes();
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(dateStr, padding, 20);
        
        // 添加页码
        ctx.textAlign = 'right';
        ctx.fillText('11岁儿童迷宫游戏 - A4纸大小', width - padding, 20);
        
        // 将canvas转换为图像数据
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        
        // 使用jsPDF生成PDF
        if (window.jspdf && window.jspdf.jsPDF) {
            const pdf = new window.jspdf.jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
            pdf.save('迷宫挑战.pdf');
        } else {
            // 如果没有jsPDF库，直接打开图像
            const newWindow = window.open();
            newWindow.document.write('<html><body style="margin:0;"><img src="' + imgData + '" style="max-width:100%;"></body></html>');
        }
    }

    // 初始化
    initialize();
}); 