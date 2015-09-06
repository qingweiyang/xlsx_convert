package com.xlsxconvert.util;

public class Format {
	public static void main(String[] args) {
		System.out.println(fromDoubleToString(0.3, 5));
	}
	
	/**
	 * 	将浮点数转换， 去掉小数点后数字 ； 2.0 －> 2,且只保留后5未
	 * 
	 * @param d
	 * @return
	 */
	public static String fromDoubleToString(double d, int leave) {
		String tmp = String.valueOf(d);
		String res = tmp;
		StringBuffer result = new StringBuffer();
		boolean meetPoint = false;
		boolean hasDouble = false;
		for(int i = 0 ; i < tmp.length() ; i++) {
			if('.' == tmp.charAt(i)) {
//				return result.toString();
				meetPoint = true;
			} else if(!meetPoint){
				result.append(tmp.charAt(i));
			} else if(meetPoint){
				if(tmp.charAt(i) > '0') {
					hasDouble = true;
				}
				
				if(leave == 0) {
					res = tmp.substring(0, i);
				}
				leave -= 1;
			}
		}
		return hasDouble ? res : result.toString();
	}
	
}
