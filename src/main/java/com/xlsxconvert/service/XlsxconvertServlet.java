package com.xlsxconvert.service;
 
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.xlsxconvert.util.JsonUtil;
import com.xlsxconvert.util.XlsUtil;
 
@WebServlet(name = "XlsxconvertServlet", urlPatterns = {"/XlsxconvertServlet"})
public class XlsxconvertServlet extends HttpServlet {
 
    private static final long serialVersionUID = -1915463532411657451L;
    private final String fileName = "/Users/yqw/Documents/Test Data.xlsx";
 
    @Override
    protected void doGet(HttpServletRequest request,
            HttpServletResponse response) throws ServletException, IOException
    {
        response.setContentType("text/html;charset=UTF-8");
        PrintWriter out = response.getWriter();
        try {
            // Write some content
            out.println(getData());
        } finally {
            out.close();
        }
    }
 
    private String getData() {
    	String res = null;
    	try {
    		System.out.println(System.getProperty("user.dir"));
			List<List<String>> tmp = XlsUtil.read(fileName);
			res = JsonUtil.convertToJson(tmp);
    	} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
    	return res;
    }
}