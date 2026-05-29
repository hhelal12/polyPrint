import WordLimitField from "./WordLimitField";
import { NAME_WORD_LIMIT, DESC_WORD_LIMIT } from "@/constants/orderLimits";

interface Props {
    orderName: string;
    description: string;
    nameWordCount: number;
    descWordCount: number;
    nameWordsLeft: number;
    descWordsLeft: number;
    onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDescChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    fieldClass: string;
}

export default function OrderBasicFields({
    orderName,
    description,
    nameWordCount,
    descWordCount,
    nameWordsLeft,
    descWordsLeft,
    onNameChange,
    onDescChange,
    fieldClass,
}: Props) {
    return (
        <div className="space-y-4">
            <WordLimitField
                as="input"
                label="Order Name / Title"
                placeholder="e.g., IT7099 Weekly Report"
                value={orderName}
                wordCount={nameWordCount}
                wordsLeft={nameWordsLeft}
                limit={NAME_WORD_LIMIT}
                onChange={onNameChange}
                fieldClass={fieldClass}
            />

            <WordLimitField
                as="textarea"
                label="Description"
                placeholder="Briefly describe what this print is for..."
                value={description}
                wordCount={descWordCount}
                wordsLeft={descWordsLeft}
                limit={DESC_WORD_LIMIT}
                onChange={onDescChange}
                fieldClass={fieldClass}
            />
        </div>
    );
}