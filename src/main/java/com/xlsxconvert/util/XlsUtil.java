package com.xlsxconvert.util;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;

import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

/**
 * xls工具类
 * 
 */
public class XlsUtil {
  
  public static List<List<String>> read(String filePath) throws IOException {
	  List<List<String>> res = new ArrayList<List<String>>();
	  
	  String fileType = filePath.substring(filePath.lastIndexOf(".") + 1, filePath.length());
	  InputStream stream = new FileInputStream(filePath);
	  Workbook wb = null;
	  if (fileType.equals("xls")) {
		  wb = new HSSFWorkbook(stream);
	  } else if (fileType.equals("xlsx")) {
		  wb = new XSSFWorkbook(stream);
	  } else {
		  System.out.println("您输入的excel格式不正确");
	  }
	  Sheet sheet1 = wb.getSheetAt(0);
	  
	  for (Row row : sheet1) {
		  List<String> tmp = new ArrayList<String>();
		  int index = 0;
		  for (Cell cell : row) {
			  if(index != cell.getColumnIndex()) {
				  //出现空值
				  for(int i = 0 ; i < cell.getColumnIndex() - index ; i++) {
					  tmp.add("");  
				  }
				  index = cell.getColumnIndex();
			  }
			  if(cell.getCellType() == Cell.CELL_TYPE_NUMERIC) {
				  tmp.add(Format.fromDoubleToString(cell.getNumericCellValue(), 5));
//				  tmp.add(String.valueOf(cell.getNumericCellValue()));
				  System.out.print(Format.fromDoubleToString(cell.getNumericCellValue(), 5) + " ");
			  } else {
				  //去换行
				  tmp.add(cell.getStringCellValue().replaceAll("\r|\n", ""));
				  System.out.print(cell.getStringCellValue().replaceAll("\r|\n", "") + " ");
			  }
			  index++;
		  }
		  res.add(tmp);
		  
		  System.out.println();
	  }
	  return res;
  }

  public static boolean write(String outPath) throws Exception {
    String fileType = outPath.substring(outPath.lastIndexOf(".") + 1, outPath.length());
    System.out.println(fileType);
    // 创建工作文档对象
    Workbook wb = null;
    if (fileType.equals("xls")) {
      wb = new HSSFWorkbook();
    } else if (fileType.equals("xlsx")) {
      wb = new XSSFWorkbook();
    } else {
      System.out.println("您的文档格式不正确！");
      return false;
    }
    // 创建sheet对象
    Sheet sheet1 = (Sheet) wb.createSheet("sheet1");
    // 循环写入行数据
    for (int i = 0; i < 5; i++) {
      Row row = (Row) sheet1.createRow(i);
      // 循环写入列数据
      for (int j = 0; j < 8; j++) {
        Cell cell = row.createCell(j);
        cell.setCellValue("测试" + j);
      }
    }
    // 创建文件流
    OutputStream stream = new FileOutputStream(outPath);
    // 写入数据
    wb.write(stream);
    // 关闭文件流
    stream.close();
    return true;
  }


  public static void main(String[] args) {
//    try {
//      XlsUtil.write(System.getProperty("user.dir") + File.separator + "test.xlsx");
//    } catch (Exception e) {
//      // TODO Auto-generated catch block
//      e.printStackTrace();
//    }
    try {
    	List<List<String>> tmp = XlsUtil.read(System.getProperty("user.dir") + File.separator + "test.xlsx");
    	for(List<String> ss : tmp) {
    		for(String str : ss) {
    			System.out.print(str + ",");
    		}
    		System.out.println();
    	}
    	String res = JsonUtil.convertToJson(tmp);
    	System.out.println(res);
    } catch (IOException e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }
  }
}