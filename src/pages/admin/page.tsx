import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
} from "convex/react";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { SignInButton } from "@/components/ui/signin.tsx";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty.tsx";
import { useAccess } from "@/hooks/use-access.ts";
import { PAGE_SCHEMAS, PAGE_SCHEMAS_ZH } from "./_lib/content-schema.ts";
import ContentEditor from "./_components/content-editor.tsx";
import SubmissionsList from "./_components/submissions-list.tsx";
import QuizLeadsList from "./_components/quiz-leads-list.tsx";
import MembersManager from "./_components/members-manager.tsx";
import ZhSiteToggle from "./_components/zh-site-toggle.tsx";
import BookSiteToggle from "./_components/book-site-toggle.tsx";

function LoadingState() {
  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-12 sm:px-6">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}

function AdminDashboard() {
  const access = useAccess();
  const navigate = useNavigate();

  // Signed-in users without any backend access are sent to the public site.
  useEffect(() => {
    if (access === "none") {
      navigate("/", { replace: true });
    }
  }, [access, navigate]);

  if (access === undefined) {
    return <LoadingState />;
  }

  if (access === "none") {
    return null;
  }

  const isAdmin = access === "admin";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
            Site Manager
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isAdmin
              ? "Edit every page's text and imagery, review inquiries, and manage your team."
              : "Review the inquiries submitted through the website."}
          </p>
        </div>
        <Button asChild variant="ghost" className="cursor-pointer">
          <Link to="/">
            <ArrowLeft className="size-4" />
            View site
          </Link>
        </Button>
      </div>

      {isAdmin ? (
        <Tabs defaultValue="content">
          <TabsList className="mb-6">
            <TabsTrigger value="content" className="cursor-pointer">
              Content
            </TabsTrigger>
            <TabsTrigger value="submissions" className="cursor-pointer">
              Inquiries
            </TabsTrigger>
            <TabsTrigger value="quizLeads" className="cursor-pointer">
              Quiz Leads
            </TabsTrigger>
            <TabsTrigger value="members" className="cursor-pointer">
              Team
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content">
            <ZhSiteToggle />
            <BookSiteToggle />
            <Tabs defaultValue="en">
              <TabsList className="mb-6">
                <TabsTrigger value="en" className="cursor-pointer">
                  English
                </TabsTrigger>
                <TabsTrigger value="zh" className="cursor-pointer">
                  中文
                </TabsTrigger>
              </TabsList>

              <TabsContent value="en">
                <Tabs defaultValue={PAGE_SCHEMAS[0].id}>
                  <TabsList className="mb-6 flex-wrap">
                    {PAGE_SCHEMAS.map((page) => (
                      <TabsTrigger
                        key={page.id}
                        value={page.id}
                        className="cursor-pointer"
                      >
                        {page.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {PAGE_SCHEMAS.map((page) => (
                    <TabsContent key={page.id} value={page.id}>
                      <ContentEditor pageId={page.id} schemas={PAGE_SCHEMAS} />
                    </TabsContent>
                  ))}
                </Tabs>
              </TabsContent>

              <TabsContent value="zh">
                <p className="mb-6 text-sm text-muted-foreground">
                  這裡的內容是網站切換成「中文」後顯示的版本,跟英文版是各自獨立的欄位,互相不會影響。文字已先放入翻譯草稿,歡迎直接覆寫;照片預設沿用英文版,可依需要另外上傳中文版專用的照片。
                </p>
                <Tabs defaultValue={PAGE_SCHEMAS_ZH[0].id}>
                  <TabsList className="mb-6 flex-wrap">
                    {PAGE_SCHEMAS_ZH.map((page) => (
                      <TabsTrigger
                        key={page.id}
                        value={page.id}
                        className="cursor-pointer"
                      >
                        {page.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {PAGE_SCHEMAS_ZH.map((page) => (
                    <TabsContent key={page.id} value={page.id}>
                      <ContentEditor pageId={page.id} schemas={PAGE_SCHEMAS_ZH} />
                    </TabsContent>
                  ))}
                </Tabs>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="submissions">
            <SubmissionsList />
          </TabsContent>

          <TabsContent value="quizLeads">
            <QuizLeadsList />
          </TabsContent>

          <TabsContent value="members">
            <MembersManager />
          </TabsContent>
        </Tabs>
      ) : (
        // Staff: inquiries + quiz leads only.
        <div className="space-y-10">
          <SubmissionsList />
          <QuizLeadsList />
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  return (
    <>
      <Authenticated>
        <AdminDashboard />
      </Authenticated>
      <AuthLoading>
        <LoadingState />
      </AuthLoading>
      <Unauthenticated>
        <div className="px-4 py-20">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ShieldAlert />
              </EmptyMedia>
              <EmptyTitle>Sign in required</EmptyTitle>
              <EmptyDescription>
                Please sign in to access the site manager.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <SignInButton />
            </EmptyContent>
          </Empty>
        </div>
      </Unauthenticated>
    </>
  );
}
