"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import type { SkinInsights } from "@/app/lib/skin-insights";
import type { SkinReportTab } from "../../types";
import { OverviewSkin } from "../../overviewSkin";
import { GenderAndTypeSkin } from "../../genderAndTypeSkin";
import { SpecialSkin } from "../../specialSkin";
import { KpiSkin } from "../../kpiSkin";

interface SkinReportTabsSectionProps {
    tabs: SkinReportTab[];
    activeTab: string;
    onTabChange: (value: string) => void;
    summaryCards: Array<{
        title: string;
        value: string;
        description: string;
        icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
        tab?: string;
        action?: string;
    }>;
    insights: SkinInsights;
    severeAcne: number;
    severePore: number;
    issueDefinitions: Array<{
        key: string;
        title: string;
        description: string;
        action: string;
        trend: {
            highShare: number;
            mediumShare: number;
            lowShare: number;
            averageScore: number | null;
        };
    }>;
    topMultiUseGoods: Array<{
        label: string;
        count: number;
        percent: number;
        modules: string[];
    }>;
    formatPercent: (value?: number) => string;
    kpiPlan: Array<{
        title: string;
        target: string;
        evidence: string;
    }>;
    onCardClick: (tab?: string) => void;
    onShowRecords: () => void;
}

export function SkinReportTabsSection({
    tabs,
    activeTab,
    onTabChange,
    summaryCards,
    insights,
    severeAcne,
    severePore,
    issueDefinitions,
    topMultiUseGoods,
    formatPercent,
    kpiPlan,
    onCardClick,
    onShowRecords,
}: SkinReportTabsSectionProps) {
    return (
        <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
            <TabsList className="flex gap-2 overflow-x-auto overflow-y-hidden bg-transparent px-1 py-1 flex-nowrap justify-start">
                {tabs.map((tab) => (
                    <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="flex flex-col items-center justify-center rounded-lg border border-white/30 bg-white/10 px-4 py-3 text-left text-black min-w-200px] data-[state=active]:bg-white data-[state=active]:text-[#f66035] data-[state=active]:shadow-sm"
                    >
                        <span className="text-sm font-semibold">{tab.label}</span>
                        <span className="text-xs text-gray-400">{tab.description}</span>
                    </TabsTrigger>
                ))}
            </TabsList>

            <OverviewSkin
                summaryCards={summaryCards}
                insights={insights}
                severeAcne={severeAcne}
                severePore={severePore}
                onCardClick={onCardClick}
                onShowRecords={onShowRecords}
            />

            <GenderAndTypeSkin insights={insights} />

            <SpecialSkin
                insights={insights}
                issueDefinitions={issueDefinitions}
                formatPercent={formatPercent}
            />

            <KpiSkin
                insights={insights}
                topMultiUseGoods={topMultiUseGoods}
                formatPercent={formatPercent}
                kpiPlan={kpiPlan}
            />
        </Tabs>
    );
}