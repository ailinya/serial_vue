import React, { useState, useCallback } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner@2.0.3';
import { 
  GripVertical,
  Eye, 
  Edit, 
  Minus, 
  Plus, 
  Download,
  Upload,
  Send,
  FileText,
  AlertCircle,
  Cpu 
} from 'lucide-react';
import { useSerialPort } from './SerialPortContext';

interface RegisterRow {
  id: string;
  address: string;
  data: string;
  value32bit: string;
  description: string;
  isSelected: boolean;
}

// 安全的复选框组件
function SafeCheckbox({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={`h-4 w-4 rounded text-xs transition-all duration-200 flex items-center justify-center ${
        checked
          ? 'bg-blue-500 text-white hover:bg-blue-600'
          : 'bg-muted/60 text-muted-foreground hover:bg-muted border border-border'
      }`}
      title={checked ? '已选择（点击取消）' : '未选择（点击选择）'}
    >
      {checked ? '✓' : '○'}
    </button>
  );
}

// 安全的输入框组件
function SafeInput({ 
  value, 
  onChange, 
  placeholder, 
  className = "" 
}: { 
  value: string; 
  onChange: (value: string) => void; 
  placeholder?: string; 
  className?: string; 
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => {
        e.stopPropagation();
        onChange(e.target.value);
      }}
      className={`px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all duration-200 hover:border-primary/30 ${className}`}
      placeholder={placeholder}
      autoComplete="off"
    />
  );
}

// 32位编辑器组件
function BitEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const numValue = parseInt(value.replace('0x', ''), 16) || 0;
  
  const toggleBit = useCallback((bitIndex: number) => {
    const newValue = numValue ^ (1 << bitIndex);
    onChange(`0x${(newValue >>> 0).toString(16).toUpperCase().padStart(8, '0')}`);
  }, [numValue, onChange]);

  return (
    <div className="space-y-1">
      {/* 32位显示，每8位一组 */}
      <div className="grid grid-cols-4 gap-1 text-xs">
        {Array.from({ length: 4 }, (_, byteIndex) => (
          <div key={byteIndex} className="border border-border/60 rounded-lg p-1.5 bg-gradient-to-b from-card to-muted/20 shadow-sm">

            {/* 位序号标注 */}
            <div className="grid grid-cols-8 gap-0.5 mb-1">
              {Array.from({ length: 8 }, (_, bitIndex) => {
                const actualBitIndex = (3 - byteIndex) * 8 + (7 - bitIndex);
                return (
                  <div key={bitIndex} className="text-center text-[10px] font-mono text-muted-foreground">
                    {actualBitIndex}
                  </div>
                );
              })}
            </div>
            {/* 位值按钮 */}
            <div className="grid grid-cols-8 gap-0.5">
              {Array.from({ length: 8 }, (_, bitIndex) => {
                const actualBitIndex = (3 - byteIndex) * 8 + (7 - bitIndex);
                const isSet = (numValue & (1 << actualBitIndex)) !== 0;
                return (
                  <button
                    key={bitIndex}
                    type="button"
                    className={`w-4 h-4 text-xs font-mono rounded cursor-pointer select-none flex items-center justify-center border transition-all duration-200 hover:scale-110 ${
                      isSet 
                        ? 'bg-gradient-to-b from-primary to-primary/80 text-primary-foreground border-primary/20 shadow-sm' 
                        : 'bg-gradient-to-b from-muted to-muted/60 hover:from-muted/80 hover:to-muted/80 border-border text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleBit(actualBitIndex);
                    }}
                    title={`Bit ${actualBitIndex}: ${isSet ? '1' : '0'} (点击切换)`}
                  >
                    {isSet ? '1' : '0'}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 紧凑型32位编辑器组件 - 每位都标注序号
function CompactBitEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const numValue = parseInt(value.replace('0x', ''), 16) || 0;
  
  const toggleBit = useCallback((bitIndex: number) => {
    const newValue = numValue ^ (1 << bitIndex);
    onChange(`0x${(newValue >>> 0).toString(16).toUpperCase().padStart(8, '0')}`);
  }, [numValue, onChange]);

  return (
    <div className="flex gap-2 items-center justify-center py-1">
      {/* 32位，每8位一组，从高位到低位 */}
      {Array.from({ length: 4 }, (_, byteIndex) => (
        <div key={byteIndex} className="flex flex-col gap-1">
          {/* 每一位的序号标注 */}
          <div className="flex gap-[1px]">
            {Array.from({ length: 8 }, (_, bitIndex) => {
              const actualBitIndex = (3 - byteIndex) * 8 + (7 - bitIndex);
              return (
                <div key={bitIndex} className="w-4 text-center text-[9px] text-muted-foreground font-mono">
                  {actualBitIndex}
                </div>
              );
            })}
          </div>
          
          {/* 位值按钮组 */}
          <div className="flex gap-[1px]">
            {Array.from({ length: 8 }, (_, bitIndex) => {
              const actualBitIndex = (3 - byteIndex) * 8 + (7 - bitIndex);
              const isSet = (numValue & (1 << actualBitIndex)) !== 0;
              return (
                <button
                  key={bitIndex}
                  type="button"
                  className={`w-4 h-4 text-[10px] font-mono font-bold cursor-pointer transition-all duration-150 hover:scale-105 active:scale-95 flex items-center justify-center leading-none ${
                    isSet 
                      ? 'bg-primary text-primary-foreground shadow-sm border border-primary/20' 
                      : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border/50'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleBit(actualBitIndex);
                  }}
                  title={`Bit ${actualBitIndex}: ${isSet ? '1' : '0'} (点击切换)`}
                  style={{
                    borderRadius: bitIndex === 0 ? '3px 0 0 3px' : bitIndex === 7 ? '0 3px 3px 0' : '0'
                  }}
                >
                  {isSet ? '1' : '0'}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// 水平32位编辑器组件 (保留原有功能)
function HorizontalBitEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const numValue = parseInt(value.replace('0x', ''), 16) || 0;
  
  const toggleBit = useCallback((bitIndex: number) => {
    const newValue = numValue ^ (1 << bitIndex);
    onChange(`0x${(newValue >>> 0).toString(16).toUpperCase().padStart(8, '0')}`);
  }, [numValue, onChange]);

  // 将32位分成4个字节，每个字节显示为十六进制
  const getByteValue = (byteIndex: number) => {
    const byteValue = (numValue >>> (byteIndex * 8)) & 0xFF;
    return byteValue.toString(16).toUpperCase().padStart(2, '0');
  };

  return (
    <div className="space-y-1 min-w-0">
      {/* 十六进制值显示 */}
      <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
        {Array.from({ length: 4 }, (_, byteIndex) => (
          <span key={byteIndex} className="text-foreground min-w-[1.5rem] text-center">
            {getByteValue(3 - byteIndex)}
          </span>
        ))}
      </div>
      
      {/* 水平位编辑器 */}
      <div className="flex gap-1 overflow-x-auto">
        {Array.from({ length: 4 }, (_, byteIndex) => (
          <div key={byteIndex} className="flex gap-0.5 shrink-0">
            {Array.from({ length: 8 }, (_, bitIndex) => {
              const actualBitIndex = (3 - byteIndex) * 8 + (7 - bitIndex);
              const isSet = (numValue & (1 << actualBitIndex)) !== 0;
              return (
                <button
                  key={bitIndex}
                  type="button"
                  className={`w-4 h-4 text-xs font-mono rounded cursor-pointer select-none flex items-center justify-center border transition-all duration-200 hover:scale-110 ${
                    isSet 
                      ? 'bg-gradient-to-b from-primary to-primary/80 text-primary-foreground border-primary/20 shadow-sm' 
                      : 'bg-gradient-to-b from-muted to-muted/60 hover:from-muted/80 hover:to-muted/80 border-border text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleBit(actualBitIndex);
                  }}
                  title={`Bit ${actualBitIndex}: ${isSet ? '1' : '0'} (点击切换)`}
                >
                  {isSet ? '1' : '0'}
                </button>
              );
            })}
            {byteIndex < 3 && <div className="w-1" />} {/* 字节间隔 */}
          </div>
        ))}
      </div>
    </div>
  );
}

// 可拖拽的行组件
function DraggableRow({ 
  row, 
  index,
  moveRow,
  updateRow, 
  deleteRow, 
  readRegister, 
  writeRegister,
  syncData
}: {
  row: RegisterRow;
  index: number;
  moveRow: (dragIndex: number, hoverIndex: number) => void;
  updateRow: (id: string, updates: Partial<RegisterRow>) => void;
  deleteRow: (id: string) => void;
  readRegister: (row: RegisterRow) => void;
  writeRegister: (row: RegisterRow) => void;
  syncData: (id: string, value: string, is32bit: boolean) => void;
}) {
  const [{ isDragging }, drag] = useDrag({
    type: 'row',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'row',
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveRow(item.index, index);
        item.index = index;
      }
    },
  });

  const handleInputChange = (field: string, value: string) => {
    if (field === 'data') {
      syncData(row.id, value, false);
    } else if (field === 'value32bit') {
      syncData(row.id, value, true);
    } else {
      updateRow(row.id, { [field]: value });
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    updateRow(row.id, { isSelected: checked });
  };

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`grid gap-2 px-4 py-2 items-center transition-all duration-200 border-b border-border/30 ${
        isDragging 
          ? 'opacity-50 scale-95 shadow-lg z-50' 
          : 'hover:bg-muted/20'
      } ${
        row.isSelected 
          ? 'bg-primary/5 border-primary/20' 
          : ''
      }`}
      style={{gridTemplateColumns: '40px 50px 80px 120px 120px 1fr 180px'}}
    >
      {/* 序号 */}
      <div className="flex items-center justify-center">
        <span className="text-xs font-mono font-medium text-primary bg-primary/10 rounded-full w-7 h-7 flex items-center justify-center border border-primary/20">
          {index + 1}
        </span>
      </div>

      {/* 拖拽句柄和复选框 */}
      <div className="flex items-center justify-center gap-1">
        <div className="cursor-move text-muted-foreground hover:text-foreground">
          <GripVertical className="h-3 w-3" />
        </div>
        <SafeCheckbox
          checked={row.isSelected}
          onChange={handleCheckboxChange}
        />
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-1 justify-center">
        <button
          type="button"
          className="h-5 w-5 p-0 flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded transition-colors"
          onClick={() => readRegister(row)}
          title="读取"
        >
          <Eye className="h-3 w-3" />
        </button>
        <button
          type="button"
          className="h-5 w-5 p-0 flex items-center justify-center text-green-600 hover:bg-green-50 rounded transition-colors"
          onClick={() => writeRegister(row)}
          title="写入"
        >
          <Edit className="h-3 w-3" />
        </button>
        <button
          type="button"
          className="h-5 w-5 p-0 flex items-center justify-center text-red-600 hover:bg-red-50 rounded transition-colors"
          onClick={() => deleteRow(row.id)}
          title="删除"
        >
          <Minus className="h-3 w-3" />
        </button>
      </div>

      {/* 地址输入 */}
      <div>
        <SafeInput
          value={row.address}
          onChange={(value) => handleInputChange('address', value)}
          placeholder="0x00000000"
          className="h-7 text-sm w-full text-center font-mono"
        />
      </div>

      {/* 32位数据输入 */}
      <div>
        <SafeInput
          value={row.data}
          onChange={(value) => handleInputChange('data', value)}
          placeholder="0x00000000"
          className="h-7 text-sm w-full text-center font-mono"
        />
      </div>

      {/* 32位编辑器 */}
      <div>
        <CompactBitEditor 
          value={row.value32bit} 
          onChange={(value) => handleInputChange('value32bit', value)} 
        />
      </div>

      {/* 说明输入 */}
      <div>
        <SafeInput
          value={row.description}
          onChange={(value) => handleInputChange('description', value)}
          placeholder="寄存器说明"
          className="h-7 text-sm w-full"
        />
      </div>
    </div>
  );
}

export function RegisterRW() {
  const { serialState } = useSerialPort();
  
  const [registerRows, setRegisterRows] = useState<RegisterRow[]>([
    { 
      id: '1', 
      address: '0x2047C00', 
      data: '0x31325233', 
      value32bit: '0x31325233',
      description: 'GPIO配置寄存器',
      isSelected: false 
    }
  ]);

  // 移动行（拖拽排序）
  const moveRow = useCallback((dragIndex: number, hoverIndex: number) => {
    setRegisterRows((prevRows) => {
      const dragRow = prevRows[dragIndex];
      const newRows = [...prevRows];
      newRows.splice(dragIndex, 1);
      newRows.splice(hoverIndex, 0, dragRow);
      return newRows;
    });
  }, []);

  const updateRow = useCallback((id: string, updates: Partial<RegisterRow>) => {
    setRegisterRows(rows => rows.map(row => 
      row.id === id ? { ...row, ...updates } : row
    ));
  }, []);

  const deleteRow = useCallback((id: string) => {
    setRegisterRows(rows => rows.filter(row => row.id !== id));
    toast.success('寄存器行已删除');
  }, []);

  const addRow = useCallback(() => {
    const newRow: RegisterRow = {
      id: Date.now().toString(),
      address: '0x00000000',
      data: '0x00000000',
      value32bit: '0x00000000',
      description: '',
      isSelected: false
    };
    setRegisterRows(rows => [...rows, newRow]);
  }, []);

  // 数据同步函数 - 32位数据完全同步
  const syncData = useCallback((id: string, value: string, is32bit: boolean) => {
    // 无论从哪个输入框修改，都保持data和value32bit完全一致
    const normalizedValue = value.toUpperCase();
    updateRow(id, { 
      data: normalizedValue,
      value32bit: normalizedValue
    });
  }, [updateRow]);

  const readRegister = useCallback((row: RegisterRow) => {
    if (!serialState.isConnected) {
      toast.error('串口未连接');
      return;
    }
    console.log(`读取寄存���: ${row.address}`);
    toast.success(`读取寄存器 ${row.address}`);
  }, [serialState.isConnected]);

  const writeRegister = useCallback((row: RegisterRow) => {
    if (!serialState.isConnected) {
      toast.error('串口未连接');
      return;
    }
    console.log(`写入寄存器: ${row.address} = ${row.data}`);
    toast.success(`写入寄存器 ${row.address}`);
  }, [serialState.isConnected]);

  // 批量操作
  const toggleSelectAll = useCallback(() => {
    const allSelected = registerRows.length > 0 && registerRows.every(row => row.isSelected);
    setRegisterRows(rows => rows.map(row => ({ ...row, isSelected: !allSelected })));
  }, [registerRows]);

  const deleteSelected = useCallback(() => {
    const selectedCount = registerRows.filter(row => row.isSelected).length;
    if (selectedCount === 0) {
      toast.error('请先选择要删除的行');
      return;
    }
    setRegisterRows(rows => rows.filter(row => !row.isSelected));
    toast.success(`已删除 ${selectedCount} 行`);
  }, [registerRows]);

  const readSelected = useCallback(() => {
    const selectedRows = registerRows.filter(row => row.isSelected);
    if (selectedRows.length === 0) {
      toast.error('请先选���要读取的行');
      return;
    }
    if (!serialState.isConnected) {
      toast.error('串口未连接');
      return;
    }
    selectedRows.forEach(row => {
      console.log(`批量读取寄存器: ${row.address}`);
    });
    toast.success(`批量读取 ${selectedRows.length} 个寄存器`);
  }, [registerRows, serialState.isConnected]);

  const writeSelected = useCallback(() => {
    const selectedRows = registerRows.filter(row => row.isSelected);
    if (selectedRows.length === 0) {
      toast.error('请先选择要写入的行');
      return;
    }
    if (!serialState.isConnected) {
      toast.error('串口未连接');
      return;
    }
    selectedRows.forEach(row => {
      console.log(`批量写入寄存器: ${row.address} = ${row.data}`);
    });
    toast.success(`批量写入 ${selectedRows.length} 个寄存器`);
  }, [registerRows, serialState.isConnected]);

  const exportConfig = useCallback(() => {
    const config = registerRows.map(row => ({
      address: row.address,
      data: row.data,
      value32bit: row.value32bit,
      description: row.description,
      isSelected: row.isSelected
    }));
    
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'register_config.json';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('配置已导出');
  }, [registerRows]);

  const importConfig = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const jsonData = JSON.parse(event.target?.result as string);
          
          // 验证数据格式
          if (!Array.isArray(jsonData)) {
            throw new Error('配置文件格式错误：应该是数组格式');
          }
          
          // 验证每个配置项的必要字段
          const validatedData = jsonData.map((item, index) => {
            if (typeof item !== 'object' || !item) {
              throw new Error(`配置项 ${index + 1} 格式错误`);
            }
            
            return {
              id: Date.now().toString() + index, // 生成新的ID
              address: item.address || '0x00000000',
              data: item.data || '0x0000',
              value32bit: item.value32bit || '0x00000000',
              description: item.description || '',
              isSelected: item.isSelected || false
            };
          });
          
          setRegisterRows(validatedData);
          toast.success(`成功导入 ${validatedData.length} 条寄存器配置`);
          
        } catch (error) {
          console.error('导入配置失败:', error);
          toast.error(`导入失败: ${error instanceof Error ? error.message : '配置文件格式错误'}`);
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  }, []);

  const selectedCount = registerRows.filter(row => row.isSelected).length;
  
  // 获取全选复选框的状态
  const getSelectAllState = () => {
    if (registerRows.length === 0) return 'unchecked';
    if (selectedCount === 0) return 'unchecked';
    if (selectedCount === registerRows.length) return 'checked';
    return 'indeterminate';
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-full">
        {/* 串口状态提示 */}
        {!serialState.isConnected && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              串口未连接。请在顶部工具栏连接串口后再进行寄存器操作。
            </AlertDescription>
          </Alert>
        )}

        {/* 粘性工具栏 - 始终在顶部 */}
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border/50 pb-4 mb-4">
          <Card className="border-2 border-primary/20 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                {/* 左侧：标题和选择信息 */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                    <h3 className="text-lg font-semibold text-foreground">寄存器读写表</h3>
                  </div>
                  {selectedCount > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm font-medium text-primary">
                        已选择 {selectedCount} 行
                      </span>
                    </div>
                  )}
                </div>

                {/* 右侧：操作按钮 */}
                <div className="flex items-center gap-2">
                  {/* 批量操作按钮 - 仅在有选中项时显示 */}
                  {selectedCount > 0 && (
                    <>
                      <div className="flex gap-1 mr-2">
                        <Button 
                          type="button"
                          variant="outline" 
                          size="sm"
                          onClick={readSelected}
                          className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          批量读取
                        </Button>
                        <Button 
                          type="button"
                          variant="outline" 
                          size="sm"
                          onClick={writeSelected}
                          className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                        >
                          <Send className="h-4 w-4 mr-1" />
                          批量写入
                        </Button>
                        <Button 
                          type="button"
                          variant="outline" 
                          size="sm"
                          onClick={deleteSelected}
                          className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                        >
                          <Minus className="h-4 w-4 mr-1" />
                          删除选中
                        </Button>
                      </div>
                      <div className="h-6 w-px bg-border"></div>
                    </>
                  )}
                  
                  {/* 常规操作按钮 */}
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm"
                    onClick={importConfig}
                    className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    导入配置
                  </Button>
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm"
                    onClick={exportConfig}
                    className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    导出配置
                  </Button>
                  <Button 
                    type="button"
                    size="sm"
                    onClick={addRow}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    添加行
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 可滚动的表格区域 */}
        <div className="flex-1 overflow-hidden">
          <Card className="h-full">
            {/* 表头 - 粘性固定 */}
            <div className="grid gap-2 px-4 py-2 bg-muted/60 border-b border-border sticky top-0 z-10" style={{gridTemplateColumns: '40px 50px 80px 120px 120px 1fr 180px'}}>
              <div className="text-xs font-medium text-muted-foreground text-center">序号</div>
              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className={`h-5 w-5 rounded text-xs transition-all duration-200 flex items-center justify-center ${
                    getSelectAllState() === 'checked'
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : getSelectAllState() === 'indeterminate'
                      ? 'bg-blue-300 text-white hover:bg-blue-400'
                      : 'bg-muted/60 text-muted-foreground hover:bg-muted border border-border'
                  }`}
                  title={`${getSelectAllState() === 'checked' ? '取消全选' : '全选'} (${selectedCount}/${registerRows.length})`}
                >
                  {getSelectAllState() === 'checked' ? '✓' : getSelectAllState() === 'indeterminate' ? '◐' : '○'}
                </button>
              </div>
              <div className="text-xs font-medium text-muted-foreground text-center">操作</div>
              <div className="text-xs font-medium text-muted-foreground text-center">地址</div>
              <div className="text-xs font-medium text-muted-foreground text-center">数据</div>
              <div className="text-xs font-medium text-muted-foreground text-center">32bit</div>
              <div className="text-xs font-medium text-muted-foreground text-center">说明</div>
            </div>

            {/* 表格内容 - 可滚动 */}
            <div className="h-full overflow-auto">
              {registerRows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Cpu className="h-12 w-12 mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">暂无寄存器配置</p>
                  <p className="text-sm">点击上方"添加行"按钮开始配置寄存器</p>
                </div>
              ) : (
                registerRows.map((row, index) => (
                  <DraggableRow
                    key={row.id}
                    row={row}
                    index={index}
                    moveRow={moveRow}
                    updateRow={updateRow}
                    deleteRow={deleteRow}
                    readRegister={readRegister}
                    writeRegister={writeRegister}
                    syncData={syncData}
                  />
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </DndProvider>
  );
}