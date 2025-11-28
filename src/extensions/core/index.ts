import { BlockquoteExtension } from "./blockquote";
import { LineBreakExtension } from "./breaks";
import {CodeBlockExtension, InlineCodeExtension } from "./code";
import { BoldExtension, ItalicExtension } from "./emphasis";
import { HeadingExtension } from "./heading";
import { HorizontalRuleExtension } from "./hr";
import { ImageExtension } from "./image";
import { LinkExtension } from "./links";
import { ListExtension, TaskListExtension } from "./lists";
import { ParagraphExtension } from "./paragraph";
import { TextExtension } from "./text";
import { StrikethroughExtension } from "./strikethrough";

export const CoreExtensions = [
    TextExtension,
    HeadingExtension,
    BoldExtension,
    ItalicExtension,
    InlineCodeExtension,
    CodeBlockExtension,
    LinkExtension,
    ImageExtension,
    ListExtension,
    TaskListExtension,
    BlockquoteExtension,
    HorizontalRuleExtension,
    StrikethroughExtension,
    ParagraphExtension,
    LineBreakExtension
] as const;

export {
    TextExtension,
    HeadingExtension,
    BoldExtension,
    ItalicExtension,
    InlineCodeExtension,
    CodeBlockExtension,
    LinkExtension,
    ImageExtension,
    ListExtension,
    TaskListExtension,
    BlockquoteExtension,
    HorizontalRuleExtension,
    StrikethroughExtension,
    ParagraphExtension,
    LineBreakExtension
};