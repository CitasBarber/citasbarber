"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import { BarChart, LineChart, PieChart } from "echarts/charts";
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([
  BarChart,
  LineChart,
  PieChart,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  CanvasRenderer,
]);

/**
 * Wrapper genérico de Apache ECharts para React (Next.js).
 * Recibe una `option` de ECharts y la aplica; se redimensiona solo con
 * ResizeObserver/`window.resize`, ideal para resoluciones móviles.
 */
export default function GraficoECharts({ option, className = "", style }) {
  const contenedorRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const el = contenedorRef.current;
    if (!el) return;
    const chart = echarts.init(el);
    chartRef.current = chart;

    // Oculta el tooltip flotante al desplazarse (evita que se pinte sobre la
    // navbar sticky: z-0 en el contenedor lo aísla en un stacking context propio).
    const ocultarTooltip = () => chart.dispatchAction({ type: "hideTip" });
    // Al tocar/hacer clic FUERA del gráfico, se descarta el tooltip.
    const onDocumentPointerDown = (e) => {
      if (el && !el.contains(e.target)) ocultarTooltip();
    };

    const onResize = () => chart.resize();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(onResize) : null;
    if (ro) ro.observe(el);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", ocultarTooltip, true);
    document.addEventListener("pointerdown", onDocumentPointerDown);

    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", ocultarTooltip, true);
      document.removeEventListener("pointerdown", onDocumentPointerDown);
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (chartRef.current && option) {
      chartRef.current.setOption(option, true);
    }
  }, [option]);

  return <div ref={contenedorRef} className={`relative z-0 ${className}`} style={style} />;
}
