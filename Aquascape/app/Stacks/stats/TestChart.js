import React, { useRef, useEffect } from 'react';
import { SvgChart, SVGRenderer } from '@wuba/react-native-echarts';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent } from 'echarts/components';
import { Dimensions } from 'react-native';

echarts.use([
  TitleComponent,
  TooltipComponent,
  SVGRenderer,
  PieChart,
]);

const E_HEIGHT = 300;
const E_WIDTH = Dimensions.get('window').width; // Get the device's width as a number

function TestChart() {
  const chartRef = useRef(null);

  useEffect(() => {
    let chart;
    if (chartRef.current) {
      chart = echarts.init(chartRef.current, null, {
        renderer: 'svg',
        width: E_WIDTH,
        height: E_HEIGHT,
      });
      const chartOption = {
        series: [
          {
            name: 'Example Chart',
            type: 'pie',
            radius: ['40%', '70%'],
            data: [
              { value: 5, name: 'Work' },
              { value: 10, name: 'Personal' },
            ],
          },
        ],
      };
      chart.setOption(chartOption);
    }
    return () => chart?.dispose();
  }, []);

  return (
    <SvgChart
      ref={chartRef}
      style={{ width: E_WIDTH, height: E_HEIGHT }} // Set dimensions here
    />
  );
}

export default TestChart;
