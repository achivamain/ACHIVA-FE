"use client";

import { useMemo } from "react";
import { addMonths, format, isSameMonth, startOfMonth } from "date-fns";
import { ko } from "date-fns/locale";
import { DayPicker, type DayButtonProps } from "react-day-picker";
import { DAY_LABELS, getDateKey, getDayIndex, WEEK_STARTS_ON } from "@/components/calendar/calendarUtils";

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

type CalendarDayButtonProps = DayButtonProps & {
  markedDates: Set<string>;
  markedCountByDate: Record<string, number>;
};

function DefaultCalendarDayButton({
  day,
  modifiers,
  markedDates,
  markedCountByDate,
  className,
  ...buttonProps
}: CalendarDayButtonProps) {
  const date = day.date;
  const dateKey = getDateKey(date);
  const dayIndex = getDayIndex(date);
  const isSelected = Boolean(modifiers.selected);
  const isWeekend = dayIndex >= 5;
  const hasMarked = markedDates.has(dateKey);
  const markedCount = markedCountByDate[dateKey] ?? 0;
  const isDisabled = Boolean(modifiers.disabled);

  return (
    <button
      {...buttonProps}
      type="button"
      className={cn(
        className,
        "flex h-[58px] w-full flex-col items-center justify-center gap-1 rounded-[14px] px-1 py-2 transition-all duration-200 active:scale-95",
        isSelected
          ? "bg-[#6B625A] shadow-md shadow-black/15"
          : hasMarked
            ? "bg-[#ECA973] shadow-sm hover:bg-[#E09961]"
            : "bg-[#F5F3F0] hover:bg-[#EEE8E1]",
        modifiers.outside && "opacity-35",
        isDisabled && "cursor-default hover:bg-inherit",
      )}
      title={hasMarked ? `${markedCount}개의 기록` : undefined}
    >
      <span
        className={cn(
          "text-[15px] font-extrabold leading-none",
          isSelected || hasMarked
            ? "text-white"
            : dayIndex === 6
              ? "text-[#EF4444]"
              : dayIndex === 5
                ? "text-[#3B82F6]"
                : "text-[#4A433D]",
          isWeekend && !isSelected && !hasMarked && "font-extrabold",
          isDisabled && "opacity-35",
        )}
      >
        {format(date, "d")}
      </span>
    </button>
  );
}

type RecordCalendarBaseProps = {
  month: Date;
  onMonthChange: (date: Date) => void;
  selectedDate: Date | null;
  onSelectDate: (date: Date | undefined) => void;
  markedDates?: Set<string>;
  markedCountByDate?: Record<string, number>;
  currentMonth?: Date;
  disableAfter?: Date;
  topContent?: React.ReactNode;
  renderDayButton?: (props: CalendarDayButtonProps) => React.JSX.Element;
  renderSelectedPanel?: (selectedDate: Date) => React.ReactNode;
  containerClassName?: string;
  selectedPanelClassName?: string;
  limitToCurrentMonth?: boolean;
  showGoToCurrentMonth?: boolean;
  calendarCellHeight?: number;
};

export default function RecordCalendarBase({
  month,
  onMonthChange,
  selectedDate,
  onSelectDate,
  markedDates = new Set<string>(),
  markedCountByDate = {},
  currentMonth,
  disableAfter,
  topContent,
  renderDayButton,
  renderSelectedPanel,
  containerClassName,
  selectedPanelClassName,
  limitToCurrentMonth = false,
  showGoToCurrentMonth = true,
  calendarCellHeight = 58,
}: RecordCalendarBaseProps) {
  const currentDisplayMonth = useMemo(() => startOfMonth(month), [month]);
  const normalizedCurrentMonth = useMemo(
    () => (currentMonth ? startOfMonth(currentMonth) : null),
    [currentMonth],
  );
  const isViewingCurrentMonth = normalizedCurrentMonth
    ? isSameMonth(currentDisplayMonth, normalizedCurrentMonth)
    : false;
  const canGoNext =
    !limitToCurrentMonth || !normalizedCurrentMonth
      ? true
      : !isViewingCurrentMonth;
  const selectedPanel = selectedDate
    ? renderSelectedPanel?.(selectedDate) ?? null
    : null;

  const DayButtonComponent = (props: DayButtonProps) => {
    const fullProps = {
      ...props,
      markedDates,
      markedCountByDate,
    };

    if (renderDayButton) {
      return renderDayButton(fullProps);
    }

    return <DefaultCalendarDayButton {...fullProps} />;
  };

  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-col overflow-hidden rounded-[20px] border border-gray-100 bg-white px-4 py-5 shadow-sm sm:px-5 sm:py-6",
        containerClassName,
      )}
    >
      {topContent ? <div className="pb-4">{topContent}</div> : null}

      <div className="flex items-center justify-between gap-2 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onMonthChange(addMonths(currentDisplayMonth, -1))}
            className="inline-flex h-[28px] items-center justify-center rounded-full bg-white px-3 text-[12px] font-bold leading-none text-[#4A433D] shadow-sm ring-1 ring-[#E5E7EB] transition-all duration-200 hover:bg-[#F9FAFB]"
          >
            이전 달
          </button>
          {showGoToCurrentMonth && normalizedCurrentMonth && !isViewingCurrentMonth ? (
            <button
              type="button"
              onClick={() => onMonthChange(normalizedCurrentMonth)}
              aria-label="이번 달로 돌아가기"
              title="이번 달로 돌아가기"
              className="inline-flex h-[28px] w-[28px] items-center justify-center rounded-full bg-white text-[#4A433D] shadow-sm ring-1 ring-[#E5E7EB] transition-all duration-200 hover:bg-[#F9FAFB]"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3.333 10a6.667 6.667 0 1 0 1.953-4.714"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3.333 4.444v3.333h3.334"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() =>
            onMonthChange(
              canGoNext ? addMonths(currentDisplayMonth, 1) : currentDisplayMonth,
            )
          }
          disabled={!canGoNext}
          className="inline-flex h-[28px] items-center justify-center rounded-full bg-white px-3 text-[12px] font-bold leading-none text-[#4A433D] shadow-sm ring-1 ring-[#E5E7EB] transition-all duration-200 hover:bg-[#F9FAFB] disabled:cursor-default disabled:text-[#C7CBD1] disabled:hover:bg-white"
        >
          다음 달
        </button>
      </div>

      <div className="min-w-0 overflow-hidden pb-4">
        <DayPicker
          mode="single"
          locale={ko}
          weekStartsOn={WEEK_STARTS_ON}
          month={currentDisplayMonth}
          selected={selectedDate ?? undefined}
          onSelect={onSelectDate}
          onMonthChange={onMonthChange}
          hideNavigation
          disabled={disableAfter ? { after: disableAfter } : undefined}
          styles={{
            root: {
              maxWidth: "100%",
            },
            months: {
              maxWidth: "100%",
            },
            month: {
              maxWidth: "100%",
            },
            month_grid: {
              tableLayout: "fixed",
              width: "100%",
              maxWidth: "100%",
            },
            week: {
              height: `${calendarCellHeight}px`,
            },
            day: {
              height: `${calendarCellHeight}px`,
              padding: 0,
              width: `${100 / 7}%`,
            },
            day_button: {
              width: "100%",
              height: "100%",
            },
          }}
          classNames={{
            root: "w-full max-w-full overflow-hidden",
            months: "w-full max-w-full",
            month: "w-full max-w-full",
            month_caption: "hidden",
            month_grid: "w-full table-fixed border-separate border-spacing-[4px]",
            weekdays:
              "[&_th:nth-child(6)]:text-[#3B82F6] [&_th:nth-child(7)]:text-[#EF4444]",
            weekday: "h-8 text-center text-[11px] font-bold text-[#9CA3AF]",
            day: "p-0 align-middle",
            day_button: "w-full",
            disabled: "pointer-events-none",
          }}
          formatters={{
            formatWeekdayName: (date) => DAY_LABELS[getDayIndex(date)],
          }}
          components={{
            DayButton: DayButtonComponent,
          }}
        />
      </div>

      {selectedPanel ? (
        <div
          className={cn(
            "mt-4 rounded-[18px] border border-[#F0EBE3] bg-[#FAFAF8] px-4 py-4",
            selectedPanelClassName,
          )}
        >
          {selectedPanel}
        </div>
      ) : null}
    </div>
  );
}
