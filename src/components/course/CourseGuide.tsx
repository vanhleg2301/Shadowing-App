"use client";

import Link from "next/link";
import { useState } from "react";
import { BottomSheet } from "@/components/BottomSheet";
import type { ScheduleSession } from "@/lib/course-schedule";

interface CourseGuideProps {
  planTitle: string;
  scheduleTitle: string;
  schedule: ScheduleSession[];
}

const ROUTES = [
  { level: "Mới từ A1 lên A2", plan: "Chọn tốc độ Slow, bật Gentle plan. Khoảng 60–75 phút mỗi ngày." },
  { level: "Hiểu A2 nhưng ngại nói", plan: "Chọn tốc độ Slow hoặc Medium, học bản đầy đủ. Khoảng 2–3 tiếng mỗi ngày." },
  { level: "Đã B1, nghe người bản xứ còn hụt", plan: "Chọn tốc độ Natural. Khoảng 3 tiếng mỗi ngày." },
];

// The "?" guide on the course pages. In Vietnamese, because it has to be clear to learners who are still at A1–A2.
export function CourseGuide({ planTitle, scheduleTitle, schedule }: CourseGuideProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className="btn-3d shrink-0 gap-2 py-1.5 pl-1.5 pr-3 text-sm" aria-haspopup="dialog">
        <span aria-hidden="true" className="grid size-7 place-items-center rounded-full bg-brand-soft font-extrabold text-brand">
          ?
        </span>
        Học thế nào?
      </button>
      {isOpen && (
        <BottomSheet title="Học khóa 7 ngày thế nào?" onClose={() => setIsOpen(false)}>
          <div lang="vi" className="space-y-6 pb-2 text-sm text-ink">
            <section>
              <h3 className="text-base font-extrabold">1. Chọn đúng lộ trình</h3>
              <ul className="mt-2 space-y-2">
                {ROUTES.map((route) => (
                  <li key={route.level} className="rounded-2xl border border-line bg-cream p-3">
                    <p className="font-bold">{route.level}</p>
                    <p className="mt-0.5 text-muted">{route.plan}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-muted">
                Bạn đang ở: <b className="text-ink">{planTitle}</b>. Chưa chắc trình độ?{" "}
                <Link href="/course/level-check" className="font-semibold text-brand">
                  Làm bài kiểm tra 2 phút
                </Link>
                .
              </p>
            </section>

            <section>
              <h3 className="text-base font-extrabold">2. Một ngày học mẫu</h3>
              <p className="mt-1 text-muted">{scheduleTitle} Giờ chỉ là gợi ý, đổi theo lịch của bạn, nhưng nên giữ đúng thứ tự.</p>
              <div className="mt-3 space-y-4">
                {schedule.map((session) => (
                  <div key={session.name}>
                    <p className="font-bold text-accent">{session.name}</p>
                    <ol className="mt-1.5 space-y-1">
                      {session.items.map((item) => (
                        <li key={`${item.time}-${item.label}`} className={`flex gap-3 ${item.isBreak ? "text-muted" : ""}`}>
                          <span className="w-11 shrink-0 font-mono text-xs leading-5 tabular-nums">{item.time}</span>
                          <span className="min-w-0 flex-1">
                            {item.label} · {item.minutes} phút
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-base font-extrabold">3. Nghỉ ngơi</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Nghỉ giữa các phần như lịch trên, đừng gộp để học liền một mạch.</li>
                <li>Giữa các buổi hãy làm việc khác, không cần học thêm.</li>
                <li>Ngủ đủ giấc, khoảng 7–8 tiếng. Tối mệt thì làm quiz rồi đi ngủ, sáng mai nói bù.</li>
                <li>Quá tải thì chia một ngày của khóa thành 2 ngày thật. Học đều quan trọng hơn học nhanh.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base font-extrabold">4. Sau 7 ngày</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Mỗi ngày vào Review ôn từ đến hạn, khoảng 10 phút.</li>
                <li>Đọc hoặc nghe 1 truyện trong Daily stories, rồi shadowing 1 video ngắn.</li>
                <li>Thấy dễ rồi thì chuyển sang bộ video nhanh hơn. Ngày nào còn khó thì học lại ngày đó.</li>
              </ul>
            </section>
          </div>
        </BottomSheet>
      )}
    </>
  );
}
