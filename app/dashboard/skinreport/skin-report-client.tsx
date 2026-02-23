"use client";

import React from "react";
import type { SkinInsights } from "@/app/lib/skin-insights";
import { DialogListCustomer } from "./dialogListCustomer";
import { DialogDetailCustomer } from "./dialogDetailCustomer";
import { SkinReportHeaderSection } from "./sections/header/SkinReportHeaderSection";
import { SkinReportTabsSection } from "./sections/tabs/SkinReportTabsSection";
import { useSkinReportState } from "./hooks/useSkinReportState";

interface SkinReportClientProps {
    insights: SkinInsights;
}

export function SkinReportClient({ insights }: SkinReportClientProps) {
    const {
        activeTab,
        setActiveTab,
        recordsOpen,
        setRecordsOpen,
        detailOpen,
        selectedRecord,
        recordPage,
        setRecordPage,
        pageSize,
        summaryCards,
        tabs,
        issueDefinitions,
        kpiPlan,
        severeAcne,
        severePore,
        topMultiUseGoods,
        sortedRecords,
        totalPages,
        paginatedRecords,
        moduleDetails,
        formatPercent,
        formatSex,
        formatDateTime,
        handleCardClick,
        handleShowRecords,
        handleViewRecord,
        handleDetailOpenChange,
    } = useSkinReportState(insights);

    return (
        <div className="p-3 sm:p-6">
            <SkinReportHeaderSection generatedAt={insights.generatedAt} />

            <SkinReportTabsSection
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                summaryCards={summaryCards}
                insights={insights}
                severeAcne={severeAcne}
                severePore={severePore}
                issueDefinitions={issueDefinitions}
                topMultiUseGoods={topMultiUseGoods}
                formatPercent={formatPercent}
                kpiPlan={kpiPlan}
                onCardClick={handleCardClick}
                onShowRecords={handleShowRecords}
            />

            <DialogListCustomer
                isOpen={recordsOpen}
                onOpenChange={setRecordsOpen}
                insights={insights}
                records={sortedRecords}
                paginatedRecords={paginatedRecords}
                page={recordPage}
                totalPages={totalPages}
                pageSize={pageSize}
                formatSex={formatSex}
                formatDateTime={formatDateTime}
                onViewRecord={handleViewRecord}
                onPageChange={setRecordPage}
            />

            <DialogDetailCustomer
                open={detailOpen}
                onOpenChange={handleDetailOpenChange}
                record={selectedRecord}
                moduleDetails={moduleDetails}
                formatSex={formatSex}
                formatDateTime={formatDateTime}
            />
        </div>
    );
}