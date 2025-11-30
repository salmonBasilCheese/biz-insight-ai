import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'sk-test-key-placeholder'
});

/**
 * Generate AI report for a store based on sales data and reviews
 */
export async function generateReport(storeData, salesData, reviewsData = []) {
    const { industry, name } = storeData;

    // Prepare data summary
    const totalRevenue = salesData.reduce((sum, s) => sum + (s.revenue || 0), 0);
    const totalVisitors = salesData.reduce((sum, s) => sum + (s.visitors || 0), 0);
    const avgCustomerValue = totalVisitors > 0 ? Math.round(totalRevenue / totalVisitors) : 0;

    // Get industry-specific prompt
    const prompt = getIndustryPrompt(industry, {
        store_name: name,
        total_revenue: totalRevenue,
        total_visitors: totalVisitors,
        avg_customer_value: avgCustomerValue,
        daily_sales: salesData,
        reviews_summary: reviewsData.slice(0, 5).map(r => ({
            rating: r.rating,
            text: r.review_text?.substring(0, 200)
        }))
    });

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are a business analyst specializing in small business management. Provide actionable insights in Japanese.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7
        });

        const reportContent = JSON.parse(completion.choices[0].message.content);
        return reportContent;

    } catch (error) {
        console.error('OpenAI API Error:', error);
        throw new Error('Failed to generate AI report');
    }
}

/**
 * Get industry-specific prompt template
 */
function getIndustryPrompt(industry, data) {
    const basePrompt = `
あなたは${getIndustryName(industry)}の経営コンサルタントです。
以下のデータを分析し、経営レポートを作成してください。

【店舗情報】
店舗名: ${data.store_name}
業種: ${getIndustryName(industry)}

【今週の実績】
総売上: ¥${data.total_revenue.toLocaleString()}
来客数: ${data.total_visitors}人
客単価: ¥${data.avg_customer_value.toLocaleString()}

【日別データ】
${data.daily_sales.map(s => `${s.date}: 売上¥${s.revenue.toLocaleString()}, 来客${s.visitors}人`).join('\n')}

${data.reviews_summary.length > 0 ? `
【最近の口コミ】
${data.reviews_summary.map(r => `★${r.rating}: ${r.text}`).join('\n')}
` : ''}

以下のJSON形式で出力してください:
{
  "summary": "今週の総評（2-3文）",
  "kpi_analysis": [
    "KPI分析ポイント1",
    "KPI分析ポイント2",
    "KPI分析ポイント3"
  ],
  "issues": [
    "改善が必要な課題1",
    "改善が必要な課題2",
    "改善が必要な課題3"
  ],
  "actions": [
    "来週実行すべき具体的アクション1",
    "来週実行すべき具体的アクション2",
    "来週実行すべき具体的アクション3",
    "来週実行すべき具体的アクション4",
    "来週実行すべき具体的アクション5"
  ],
  "forecast": {
    "revenue": 予測売上額（数値）,
    "visitors": 予測来客数（数値）,
    "reasoning": "予測の根拠（1文）"
  }
}

${getIndustrySpecificGuidance(industry)}
`;

    return basePrompt;
}

/**
 * Get industry display name in Japanese
 */
function getIndustryName(industry) {
    const names = {
        restaurant: '飲食店',
        clinic: 'クリニック',
        salon: '美容室',
        real_estate: '不動産'
    };
    return names[industry] || industry;
}

/**
 * Get industry-specific analysis guidance
 */
function getIndustrySpecificGuidance(industry) {
    const guidance = {
        restaurant: `
【飲食店特有の分析ポイント】
- 回転率と時間帯別の来客傾向
- メニュー改善の提案
- リピート率向上施策
- 季節要因の考慮
`,
        clinic: `
【クリニック特有の分析ポイント】
- 初診・再診の比率
- 予約枠の最適化
- 患者満足度向上施策
- 診療時間の効率化
`,
        salon: `
【美容室特有の分析ポイント】
- リピート率とサイクル
- 単価向上（メニュー提案）
- 予約の埋まり具合
- スタッフ稼働率
`,
        real_estate: `
【不動産特有の分析ポイント】
- 内見から成約への転換率
- 問い合わせ経路の分析
- 物件タイプ別の動向
- 競合物件との比較
`
    };

    return guidance[industry] || '';
}

export default { generateReport };
