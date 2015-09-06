   var countPerPage = 10;

  // 点击分页，执行翻页操作
  function pageClick(select, currentPage, pages) {
    var cp = $(select).text();
    if(cp == "上一页" && currentPage > 1) {
      currentPage = currentPage - 1;
    } else if(cp == "下一页" && currentPage < pages) {
      currentPage = currentPage + 1;
    } else if(cp != "上一页" && cp != "下一页") {
    	currentPage = cp;
    } 
    showAllOrders(Number(currentPage), countPerPage);
  }
  
  // 分页的显示
  function pageDivision(pages, currentPage) {
    $(".pagination").children().remove();
    // 共展示的分页条数（如10页）
    var pnum = 7;
    var mid = parseInt(pnum/2);
    var begin = 1;
    var last = begin + pages;
    if(pages > pnum) {
      if(currentPage - mid > 0 && currentPage + mid - 1 < pages) {
        begin = currentPage -mid;
        last = begin + pnum;
      } else if ( (currentPage - 1 + mid ) >= pages) {
        begin = pages - pnum + 1;
        last = begin + pnum;
      } else if (currentPage - mid < 1) {
        last = begin + pnum;
      }
    }
    
    // 上一页
    $(".pagination").append('<li><a href="#" onclick="pageClick(this, '+currentPage+', '+pages+');">上一页</a></li>');
    for(var i = begin ; i < last ; i ++) {
      if(i == currentPage) {
        // 设置当前页class
        $(".pagination").append('<li class="active"><a href="#" onclick="pageClick(this, '+i+', '+pages+');">'+i+'</a></li>');
      } else {
        $(".pagination").append('<li><a href="#" onclick="pageClick(this, '+i+', '+pages+');">'+i+'</a></li>');
      }
    }
    // 下一页
    $(".pagination").append('<li><a href="#" onclick="pageClick(this, '+currentPage+', '+pages+');">下一页</a></li>');
    
  }