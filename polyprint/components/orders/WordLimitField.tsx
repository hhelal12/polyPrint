import React from "react";

interface BaseProps {
    label: string;
    wordCount: number;
    wordsLeft: number;
    limit: number;
    placeholder: string;
    fieldClass: string;
}

interface InputProps extends BaseProps {
    as: "input";
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface TextareaProps extends BaseProps {
    as: "textarea";
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

type Props = InputProps | TextareaProps;

function getBadgeColor(left: number, limit: number) {
    if (left === 0) return "text-red-500 font-bold";
    if (left / limit <= 0.2) return "text-amber-500 font-semibold";
    return "text-slate-400";
}

function getBarColor(left: number, warningThreshold: number) {
    if (left === 0) return "bg-red-400";
    if (left <= warningThreshold) return "bg-amber-400";
    return "bg-cyan-400";
}

export default function WordLimitField(props: Props) {
    const { label, wordCount, wordsLeft, limit, placeholder, fieldClass } = props;
    const warningThreshold = Math.round(limit * 0.2);
    const atLimit = wordsLeft === 0;
    const limitClass = atLimit ? "border-red-300 focus:ring-red-400" : "";

    return (
        <div>
            {/* Label + counter */}
            <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-slate-700">{label}</label>
                <span className={`text-xs tabular-nums ${getBadgeColor(wordsLeft, limit)}`}>
                    {wordCount} / {limit} words
                </span>
            </div>

            {/* Input or Textarea */}
            {props.as === "input" ? (
                <input
                    type="text"
                    required
                    placeholder={placeholder}
                    value={props.value}
                    onChange={props.onChange}
                    className={`${fieldClass} ${limitClass}`}
                />
            ) : (
                <textarea
                    placeholder={placeholder}
                    value={props.value}
                    onChange={props.onChange}
                    className={`${fieldClass} h-24 resize-none ${limitClass}`}
                />
            )}

            {/* Progress bar */}
            <div className="mt-1.5 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-300 ${getBarColor(wordsLeft, warningThreshold)}`}
                    style={{ width: `${(wordCount / limit) * 100}%` }}
                />
            </div>

            {/* Limit warning */}
            {atLimit && (
                <p className="text-[11px] text-red-500 mt-1">Word limit reached.</p>
            )}
        </div>
    );
}