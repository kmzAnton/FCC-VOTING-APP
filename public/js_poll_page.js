var altura = $('.col-xs-4').height();
var anchoLeft = $('.col-xs-4').width();
var ancho = $('.col-xs-8').width();


$('.btn_edit').css('left', anchoLeft-95);


d3.json(window.location.pathname.concat('/json.json'), function(err, data){
  if(err){ return console.log(err)};
  
  
  var data = data;
  var width = ancho*1-210;
  var height = altura*1 + 80;
  var radius = Math.min(width, height) / 2 - 70;
  
  var color = d3.scaleOrdinal(d3.schemeCategory20);
  
  var arc = d3.arc()
      .innerRadius(radius-70)
      .outerRadius(radius-10)
      .cornerRadius(7);
  
  var labelArc = d3.arc()
        .outerRadius(radius - 40)
        .innerRadius(radius - 40);
  
  var pie = d3.pie()
      .value(function(d) { return d.count;})(data.pollOptions);
  
  var svg = d3.select('#arc')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', 'translate('+width*0.5+','+(height/2)+')');
  
  var g = svg.selectAll('.arc')
      .data(pie)
      .enter().append('g')
      .attr('class', 'arc');
  
  g.append('path')
      .attr('d', arc)
      .style("fill", function(d,i){return color(i)});
  
  g.append("text")
    .attr("transform", function(d) {
        var c = labelArc.centroid(d);
        return "translate(" + c[0]*1.4 +"," + c[1]*1.5 + ")";
    })
    .attr("dx", "-1em")
    .text(function(d,i) { return (data.pollOptions[i].count == 0 ? "" : data.pollOptions[i].optName); })
    // .text(function(d,i) { return data.pollOptions[i].optName;})	
    .style("fill", "green");
        
});

