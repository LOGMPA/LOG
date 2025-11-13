import React, { useMemo, useState } from "react";
import { useSolicitacoes } from "../hooks/useSolicitacoes";
import { format, subDays } from "date-fns";
import { Clock, Truck, Navigation, CheckCircle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import StatusCard from "../components/logistica/StatusCard";
import SolicitacaoCard from "../components/logistica/SolicitacaoCard";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

/* ======== helpers de data local (sem UTC) ======== */
const parseBR = (s) => {
  if (!s) return null;
  if (s instanceof Date) return s;
  const m = String(s).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
  const d = new Date(s);
  return isNaN(d) ? null : d;
};
const monthKeyLocal = (dLike) => {
  const d = dLike instanceof Date ? dLike : parseBR(dLike);
  if (!d) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

/* ======== normalização de cidade ======== */
const NORM = (t) =>
  String(t || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toUpperCase()
    .trim();

const CIDADES = [
  "PONTA GROSSA",
  "CASTRO",
  "ARAPOTI",
  "TIBAGI",
  "IRATI",
  "PRUDENTÓPOLIS",
  "GUARAPUAVA",
  "QUEDAS DO IGUAÇU",
];
const MAP_CANON = new Map(CIDADES.map((c) => [NORM(c), c]));
const canonCidade = (txt) => MAP_CANON.get(NORM(txt)) || null;

/* ======== cores ======== */
const COR_TERC = "#F2B300";  // amarelo mais escuro (pedido)
const COR_PROP = "#1B5E20";  // verde escuro
const GRID_LIGHT = "#ECECEC"; // grid mais claro
const BADGE_BG = "#0B2B6B";   // azul-escuro do badge de quantidade
const BADGE_TEXT = "#FFFFFF";
const TOTAL_COLOR = "#092357"; // azul-escuro p/ rótulo do total

/* ======== label custom para o badge de quantidade ======== */
function QtdBadge({ x, y, width, value }) {
  if (value == null) return null;
  const w = 24, h = 16;
  const cx = x + width / 2 - w / 2;
  const cy = y - h - 2; // encostado na base interna
  return (
    <g>
      <rect x={cx} y={cy} rx={3} ry={3} width={w} height={h} fill={BADGE_BG} />
      <text
        x={cx + w / 2}
        y={cy + h / 2 + 4}
        textAnchor="middle"
        fontSize="10"
        fill={BADGE_TEXT}
        fontWeight="600"
      >
        {value}
      </text>
    </g>
  );
}

/* ======== label custom p/ TOTAL centralizado no topo ======== */
function TotalLabel({ x, y, width, value }) {
  if (value == null) return null;
  const cx = x + width / 2;
  const cy = y - 6; // 6p
