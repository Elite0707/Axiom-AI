"""
Generates 3 sample M&A test documents:
  1. TechAcquire_SPA_Hidden_Clauses.pdf   — Share Purchase Agreement with dangerous hidden clauses
  2. GreenField_Merger_Hidden_Clauses.pdf — Merger Agreement with buried liability traps
  3. Clean_Asset_Purchase_Agreement.pdf   — Well-drafted, clean Asset Purchase Agreement

Run: python generate_test_docs.py
"""

from fpdf import FPDF
from pathlib import Path
import os

OUTPUT_DIR = Path(__file__).parent
OUTPUT_DIR.mkdir(exist_ok=True)


def clean_text(text: str) -> str:
    """Replace non-Latin-1 unicode characters with ASCII equivalents."""
    replacements = {
        "\u2014": " - ",   # em dash
        "\u2013": " - ",   # en dash
        "\u2018": "'",     # left single quote
        "\u2019": "'",     # right single quote
        "\u201c": '"',     # left double quote
        "\u201d": '"',     # right double quote
        "\u2022": "*",     # bullet
        "\u2026": "...",   # ellipsis
        "\u00a0": " ",     # non-breaking space
        "\u00a7": "Sec.",  # section symbol
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    return text


# ─── PDF Helper ───────────────────────────────────────────────────────────────

class LegalPDF(FPDF):
    def __init__(self, title):
        super().__init__()
        self.doc_title = clean_text(title)
        self.set_margins(25, 20, 25)
        self.set_auto_page_break(auto=True, margin=20)

    def header(self):
        self.set_font("Helvetica", "I", 7)
        self.set_text_color(150, 150, 150)
        self.cell(0, 6, self.doc_title, align="C")
        self.ln(2)
        self.set_text_color(0, 0, 0)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 7)
        self.set_text_color(150, 150, 150)
        self.cell(0, 6, f"Page {self.page_no()}", align="C")
        self.set_text_color(0, 0, 0)

    def cover(self, title, subtitle, parties, date):
        self.add_page()
        self.ln(30)
        self.set_font("Helvetica", "B", 18)
        self.set_text_color(20, 20, 80)
        self.multi_cell(0, 10, clean_text(title), align="C")
        self.ln(4)
        self.set_font("Helvetica", "", 11)
        self.set_text_color(80, 80, 80)
        self.multi_cell(0, 7, clean_text(subtitle), align="C")
        self.ln(20)
        self.set_font("Helvetica", "", 10)
        self.set_text_color(0, 0, 0)
        for party in parties:
            self.cell(0, 7, clean_text(party), align="C")
            self.ln()
        self.ln(10)
        self.set_font("Helvetica", "I", 10)
        self.set_text_color(100, 100, 100)
        self.cell(0, 7, clean_text(f"Dated: {date}"), align="C")
        self.ln()
        self.cell(0, 7, "STRICTLY CONFIDENTIAL", align="C")
        self.set_text_color(0, 0, 0)

    def section(self, heading, level=1):
        self.ln(5)
        if level == 1:
            self.set_font("Helvetica", "B", 13)
            self.set_text_color(20, 20, 80)
        elif level == 2:
            self.set_font("Helvetica", "B", 11)
            self.set_text_color(40, 40, 100)
        else:
            self.set_font("Helvetica", "BI", 10)
            self.set_text_color(60, 60, 120)
        self.multi_cell(0, 7, clean_text(heading))
        self.set_text_color(0, 0, 0)
        self.ln(1)

    def body(self, text, indent=0):
        self.set_font("Helvetica", "", 10)
        self.set_text_color(30, 30, 30)
        orig_l = 25
        self.set_left_margin(orig_l + indent)
        self.set_x(orig_l + indent)
        width = self.w - self.r_margin - (orig_l + indent)
        self.multi_cell(width, 6, clean_text(text))
        self.set_left_margin(orig_l)
        self.set_x(orig_l)
        self.ln(1)

    def clause(self, number, title, text):
        self.ln(3)
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(0, 0, 0)
        self.set_left_margin(25)
        self.set_x(25)
        self.multi_cell(self.w - 50, 6, clean_text(f"{number}  {title}"))
        self.set_font("Helvetica", "", 10)
        self.set_text_color(40, 40, 40)
        indent = 30
        self.set_left_margin(indent)
        self.set_x(indent)
        width = self.w - self.r_margin - indent
        self.multi_cell(width, 6, clean_text(text))
        self.set_left_margin(25)
        self.set_x(25)
        self.ln(1)


    def divider(self):
        self.ln(3)
        self.set_draw_color(180, 180, 200)
        self.line(25, self.get_y(), 185, self.get_y())
        self.ln(4)


# ══════════════════════════════════════════════════════════════════════════════
# DOCUMENT 1: HIDDEN CLAUSES — Share Purchase Agreement
# ══════════════════════════════════════════════════════════════════════════════

def generate_doc1():
    pdf = LegalPDF("SHARE PURCHASE AGREEMENT — TechAcquire Corp / NovaSoft Ltd")
    pdf.cover(
        title="SHARE PURCHASE AGREEMENT",
        subtitle="Acquisition of 100% of the Issued Share Capital of NovaSoft Limited",
        parties=[
            "BETWEEN: TechAcquire Corporation (Acquirer)",
            "AND: NovaSoft Limited (Target)",
            "AND: Mr. Arjun Mehta & Ms. Priya Sharma (Sellers)",
        ],
        date="October 10, 2026"
    )

    # ── RECITALS ──
    pdf.add_page()
    pdf.section("RECITALS")
    pdf.body(
        "WHEREAS, the Sellers own one hundred percent (100%) of the issued and outstanding shares of NovaSoft Limited "
        "(the 'Company'), a private limited company incorporated under the laws of India with CIN: U72200MH2019PTC123456;\n\n"
        "WHEREAS, the Acquirer wishes to purchase, and the Sellers wish to sell, all Shares subject to the terms and "
        "conditions of this Share Purchase Agreement (the 'Agreement');\n\n"
        "NOW, THEREFORE, in consideration of the mutual covenants and agreements set forth herein, and for other good "
        "and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the parties agree as follows:"
    )

    # ── ARTICLE 1: DEFINITIONS ──
    pdf.section("ARTICLE 1: DEFINITIONS AND INTERPRETATION")
    pdf.clause("1.1", "Definitions", (
        '"Acquisition Price" means INR 48,00,00,000 (Indian Rupees Forty-Eight Crores), subject to adjustment as set '
        'forth in Schedule 3.\n'
        '"Business Day" means any day other than a Saturday, Sunday, or public holiday in Mumbai, India.\n'
        '"Closing" means the completion of the sale and purchase of the Shares under this Agreement.\n'
        '"Closing Date" means thirty (30) Business Days after satisfaction of all Conditions Precedent.\n'
        '"Encumbrance" means any mortgage, charge, pledge, lien, option, restriction, right of first refusal, '
        'right of pre-emption, third-party right or interest, or other encumbrance.\n'
        '"Material Adverse Change" or "MAC" has the meaning set forth in Article 8.\n'
        '"Shares" means all 10,000 equity shares of INR 10 each, constituting 100% of the paid-up share capital of '
        'the Company.'
    ))

    # ── ARTICLE 2: SALE AND PURCHASE ──
    pdf.section("ARTICLE 2: SALE AND PURCHASE OF SHARES")
    pdf.clause("2.1", "Agreement to Sell and Purchase", (
        "Subject to the terms and conditions of this Agreement, the Sellers agree to sell and the Acquirer agrees to "
        "purchase the Shares, free from all Encumbrances, together with all rights attaching thereto as of the Closing Date."
    ))
    pdf.clause("2.2", "Consideration", (
        "The total Acquisition Price is INR 48,00,00,000 payable as follows:\n"
        "  (a) INR 36,00,00,000 (75%) payable on the Closing Date;\n"
        "  (b) INR 9,60,00,000 (20%) placed in escrow for a period of thirty-six (36) months post-Closing "
        "as a Warranty Escrow Amount;\n"
        "  (c) INR 2,40,00,000 (5%) as a deferred Earnout Payment, subject to the Company achieving "
        "revenue targets as set forth in Schedule 4."
    ))

    # ── ARTICLE 3: CONDITIONS PRECEDENT ──
    pdf.section("ARTICLE 3: CONDITIONS PRECEDENT TO CLOSING")
    pdf.clause("3.1", "Conditions Precedent to Acquirer's Obligations", (
        "The Acquirer's obligation to complete the purchase of the Shares is conditional upon:\n"
        "  (a) Approval from the Competition Commission of India (CCI) under the Competition Act, 2002;\n"
        "  (b) Receipt of all required third-party consents, including material customer contracts;\n"
        "  (c) No Material Adverse Change having occurred between the date hereof and the Closing Date;\n"
        "  (d) All Representations and Warranties of the Sellers being true and accurate in all material respects;\n"
        "  (e) Foreign Exchange Management Act (FEMA) approvals for cross-border payment structures."
    ))
    pdf.clause("3.2", "Waiver of Conditions", (
        "The Acquirer may, in its sole and absolute discretion, waive any of the Conditions Precedent in Clause 3.1, "
        "in whole or in part, by written notice to the Sellers. Any such waiver shall not prejudice the Acquirer's "
        "rights under the Representations and Warranties."
    ))

    # ── ARTICLE 4: REPRESENTATIONS (HIDDEN: SELLER-FAVORABLE) ──
    pdf.section("ARTICLE 4: REPRESENTATIONS AND WARRANTIES OF THE SELLERS")
    pdf.clause("4.1", "Sellers' Representations", (
        "Each Seller, jointly and severally, represents and warrants to the Acquirer that each of the statements "
        "contained in Schedule 2 (Sellers' Warranties) is true, accurate, and not misleading as of the date of "
        "this Agreement."
    ))
    pdf.clause("4.2", "Warranty Limitations — IMPORTANT",
        # ← HIDDEN CLAUSE 1: Awareness qualifier guts all warranties
        "Notwithstanding any other provision of this Agreement, the Sellers shall have no liability in respect of any "
        "Warranty Claim to the extent that:\n"
        "  (a) the facts, circumstances, or matters giving rise to such Warranty Claim were actually known to "
        "the Acquirer or its representatives, advisors, or agents prior to the date of this Agreement;\n"
        "  (b) [HIDDEN RISK] specific disclosure is deemed to have been made of all information contained in "
        "any data room document, index, summary, or oral briefing provided during due diligence, irrespective of "
        "whether the Acquirer had the opportunity to review such information, and regardless of whether such "
        "information was indexed, searchable, or accessible in practice;\n"
        "  (c) the liability would not have arisen but for any act, omission, or transaction by or on behalf of "
        "the Acquirer or any Group Company after Closing carried out otherwise than in the ordinary course of business;\n"
        "  (d) [HIDDEN RISK] any provision, reserve, or allowance has been made in the Completion Accounts "
        "in respect of the matter giving rise to the Warranty Claim, even if such provision was embedded in general "
        "accounting reserves and not specifically identified as relating to the matter in question."
    )
    pdf.clause("4.3", "Cap on Liability", (
        # ← HIDDEN CLAUSE 2: Unreasonably low cap
        "The aggregate liability of the Sellers in respect of all Warranty Claims and Tax Claims shall not exceed "
        "an amount equal to fifteen percent (15%) of the Acquisition Price (INR 7,20,00,000) in aggregate. "
        "This cap applies irrespective of the nature of the breach or whether such breach was fraudulent, willful, "
        "or deliberate. For the avoidance of doubt, this cap shall also apply to any claim arising from undisclosed "
        "litigation, regulatory investigations, or environmental liabilities existing as of the Closing Date."
    ))
    pdf.clause("4.4", "Time Limitation on Claims", (
        # ← HIDDEN CLAUSE 3: Short limitation period
        "No Warranty Claim shall be brought by the Acquirer unless written notice of such claim is given to the Sellers "
        "within twelve (12) months of the Closing Date. Claims relating to Tax Warranties must be brought within "
        "eighteen (18) months of the Closing Date. Any claim not notified within such period shall be absolutely "
        "barred, regardless of when the Acquirer becomes aware of the relevant facts."
    ))

    # ── ARTICLE 5: MAC CLAUSE ──
    pdf.section("ARTICLE 5: RESTRICTIVE COVENANTS — POST-CLOSING")
    pdf.clause("5.1", "Non-Compete", (
        "Each Seller undertakes to the Acquirer that, for a period of twenty-four (24) months after the Closing Date, "
        "they shall not, directly or indirectly, engage in any business that competes with the Company's business "
        "as conducted as of the Closing Date in the territories of India and Southeast Asia."
    ))
    pdf.clause("5.2", "Non-Solicitation", (
        "For a period of thirty-six (36) months after the Closing Date, the Sellers shall not solicit, entice, or "
        "recruit any employee, consultant, or contractor of the Company who was employed during the twelve (12) "
        "months preceding the Closing Date."
    ))
    pdf.clause("5.3", "Seller's Right to Compete — Exception",
        # ← HIDDEN CLAUSE 4: Massive carve-out that nullifies non-compete
        "Notwithstanding Clause 5.1, the restrictions in this Article 5 shall not apply to any activity carried on "
        "by a Seller as a passive investor holding less than thirty percent (30%) of the equity of any competing entity, "
        "or to any business in the field of enterprise software, cloud infrastructure, artificial intelligence, "
        "data analytics, or mobile applications, PROVIDED THAT such business was in existence prior to the Closing Date "
        "in any form, including as a concept, prototype, or unregistered business plan. The Sellers confirm that "
        "TechRival Pvt Ltd (incorporated October 2025) is hereby excluded from the scope of the non-compete."
    )

    # ── ARTICLE 6: INDEMNIFICATION ──
    pdf.section("ARTICLE 6: INDEMNIFICATION")
    pdf.clause("6.1", "Seller Indemnification", (
        "Subject to the limitations in Article 4, the Sellers shall indemnify and hold harmless the Acquirer from "
        "any losses, damages, costs, and expenses arising from any breach of this Agreement."
    ))
    pdf.clause("6.2", "Acquirer Indemnification — Uncapped",
        # ← HIDDEN CLAUSE 5: Acquirer has uncapped liability
        "The Acquirer shall indemnify the Sellers on a full indemnity basis, without any financial cap, "
        "time limitation, or materiality threshold, for any losses, liabilities, claims, costs, or expenses "
        "arising from or in connection with:\n"
        "  (a) the conduct of the Company's business after the Closing Date;\n"
        "  (b) any breach of the Acquirer's representations or obligations under this Agreement;\n"
        "  (c) any regulatory action, governmental investigation, or third-party claim arising from any product "
        "or service of the Company at any time after Closing, whether or not the relevant product or service "
        "was developed or sold prior to Closing.\n"
        "For the avoidance of doubt, the indemnity in this Clause 6.2 is unlimited in quantum and duration."
    )

    # ── ARTICLE 7: MAC CLAUSE ──
    pdf.section("ARTICLE 7: MATERIAL ADVERSE CHANGE")
    pdf.clause("7.1", "Definition of MAC", (
        "For the purposes of this Agreement, 'Material Adverse Change' means any event, circumstance, or development "
        "that has, or would reasonably be expected to have, a material adverse effect on the business, assets, "
        "liabilities, financial condition, or results of operations of the Company, taken as a whole."
    ))
    pdf.clause("7.2", "MAC Exclusions",
        # ← HIDDEN CLAUSE 6: Extremely broad MAC exclusions favor Sellers
        "Notwithstanding the foregoing, none of the following shall constitute or be taken into account in "
        "determining whether a Material Adverse Change has occurred:\n"
        "  (a) changes in general economic, financial market, or geopolitical conditions globally or in India;\n"
        "  (b) changes in laws, regulations, or accounting standards;\n"
        "  (c) any change in the Company's revenue, profits, customer base, or key personnel resulting from the "
        "announcement of this transaction or any fact that becomes known to third parties as a result of the "
        "due diligence process;\n"
        "  (d) any event, occurrence, or condition that is disclosed in the data room or otherwise to the "
        "Acquirer prior to the date of this Agreement, including but not limited to the loss of the Company's "
        "three largest customers (representing 72% of annual revenue), provided such loss was disclosed in any "
        "form prior to the date hereof;\n"
        "  (e) acts of God, pandemic, epidemic, or force majeure events of any nature."
    )

    # ── GOVERNING LAW ──
    pdf.section("ARTICLE 8: GOVERNING LAW AND DISPUTE RESOLUTION")
    pdf.clause("8.1", "Governing Law", (
        "This Agreement shall be governed by and construed in accordance with the laws of India."
    ))
    pdf.clause("8.2", "Arbitration", (
        "Any dispute arising out of or in connection with this Agreement shall be referred to and finally resolved "
        "by arbitration under the Arbitration and Conciliation Act, 1996. The seat of arbitration shall be Mumbai. "
        "The language of arbitration shall be English. The arbitral tribunal shall consist of three arbitrators."
    ))

    # ── SIGNATURE ──
    pdf.add_page()
    pdf.section("EXECUTION PAGE")
    pdf.body(
        "IN WITNESS WHEREOF, the parties have executed this Share Purchase Agreement as of the date first written above."
    )
    pdf.ln(10)
    pdf.set_font("Helvetica", "B", 10)
    sig_data = [
        ("TechAcquire Corporation", "Authorised Signatory", "Name: ___________________", "Title: ___________________"),
        ("NovaSoft Limited", "Authorised Signatory", "Name: ___________________", "Title: ___________________"),
        ("Mr. Arjun Mehta", "Seller", "PAN: ___________________", ""),
        ("Ms. Priya Sharma", "Seller", "PAN: ___________________", ""),
    ]
    for name, role, l1, l2 in sig_data:
        pdf.set_font("Helvetica", "B", 10)
        pdf.cell(0, 7, name)
        pdf.ln()
        pdf.set_font("Helvetica", "", 9)
        pdf.cell(0, 6, role)
        pdf.ln()
        pdf.cell(0, 6, l1)
        pdf.ln()
        if l2:
            pdf.cell(0, 6, l2)
            pdf.ln()
        pdf.cell(0, 6, "Date: ___________________")
        pdf.ln(10)

    path = OUTPUT_DIR / "1_TechAcquire_SPA_Hidden_Clauses.pdf"
    pdf.output(str(path))
    print(f"  Created: {path.name}")


# ══════════════════════════════════════════════════════════════════════════════
# DOCUMENT 2: HIDDEN CLAUSES — Merger Agreement
# ══════════════════════════════════════════════════════════════════════════════

def generate_doc2():
    pdf = LegalPDF("MERGER AGREEMENT — GreenField Energy / SolarBridge Corp")
    pdf.cover(
        title="AGREEMENT AND PLAN OF MERGER",
        subtitle="By and Among GreenField Energy Holdings Inc. and SolarBridge Corporation",
        parties=[
            "ACQUIRER: GreenField Energy Holdings Inc. (Delaware Corporation)",
            "TARGET: SolarBridge Corporation (Delaware Corporation)",
            "MERGER SUB: GF Merger Subsidiary Inc. (Delaware Corporation)",
        ],
        date="September 28, 2026"
    )

    pdf.add_page()
    pdf.section("PREAMBLE")
    pdf.body(
        "This Agreement and Plan of Merger (this 'Agreement') is entered into as of September 28, 2026, "
        "by and among GreenField Energy Holdings Inc., a Delaware corporation ('Parent'), "
        "GF Merger Subsidiary Inc., a Delaware corporation and wholly owned subsidiary of Parent ('Merger Sub'), "
        "and SolarBridge Corporation, a Delaware corporation (the 'Company'). "
        "The Board of Directors of each of Parent, Merger Sub, and the Company has determined that the Merger is "
        "advisable and in the best interests of their respective stockholders."
    )

    pdf.section("ARTICLE I: THE MERGER")
    pdf.clause("1.1", "The Merger", (
        "Upon the terms and subject to the conditions of this Agreement, and in accordance with the Delaware General "
        "Corporation Law (DGCL), Merger Sub shall be merged with and into the Company (the 'Merger'). "
        "The Company shall be the surviving corporation (the 'Surviving Corporation')."
    ))
    pdf.clause("1.2", "Effective Time", (
        "Subject to the provisions of this Agreement, the parties shall cause the Merger to be consummated by filing "
        "a Certificate of Merger with the Secretary of State of the State of Delaware. "
        "The Merger shall become effective at the time of such filing (the 'Effective Time')."
    ))
    pdf.clause("1.3", "Merger Consideration", (
        "At the Effective Time, each share of Company Common Stock issued and outstanding immediately prior to the "
        "Effective Time shall be converted into the right to receive $24.50 in cash (the 'Merger Consideration'), "
        "representing a premium of approximately 18% over the Company's 30-day VWAP."
    ))

    pdf.section("ARTICLE II: REPRESENTATIONS AND WARRANTIES OF THE COMPANY")
    pdf.clause("2.1", "Organization and Qualification", (
        "The Company is a corporation duly organized, validly existing, and in good standing under the laws of Delaware. "
        "The Company has all requisite corporate power and authority to own, lease, and operate its properties."
    ))
    pdf.clause("2.2", "Financial Statements", (
        "The Company's audited financial statements for the fiscal years ended December 31, 2024, and 2023, "
        "fairly present in all material respects the financial condition and results of operations of the Company."
    ))
    pdf.clause("2.3", "Absence of Certain Changes", (
        "Except as disclosed in Schedule 2.3, since December 31, 2024, the Company has conducted its business "
        "in the ordinary course and there has not been any Material Adverse Effect."
    ))
    pdf.clause("2.4", "Litigation",
        # ← HIDDEN CLAUSE 1: Disclosure only of 'pending' litigation — excludes threatened
        "Except as set forth in Schedule 2.4, there is no action, suit, proceeding, claim, or investigation "
        "that is pending or, to the Knowledge of the Company, threatened against the Company. "
        "For the avoidance of doubt, 'Knowledge of the Company' means the actual knowledge (without any duty to "
        "investigate) of the Chief Executive Officer and Chief Financial Officer only, as of the date of this Agreement. "
        "[RISK: EPA enforcement investigation and three patent infringement notices received by Legal Counsel in Q3 2026 "
        "are excluded from this representation because they were addressed to the General Counsel and not the CEO/CFO.]"
    )

    pdf.section("ARTICLE III: REPRESENTATIONS AND WARRANTIES OF PARENT")
    pdf.clause("3.1", "Financing",
        # ← HIDDEN CLAUSE 2: Financing condition with broad out
        "Parent has received a financing commitment letter (the 'Commitment Letter') from First National Bank "
        "for senior secured credit facilities totaling $1.8 billion. The obligation of the lenders to provide "
        "the financing is subject to customary conditions, including but not limited to: absence of a MAC at the "
        "lender's sole discretion, satisfactory completion of lender due diligence, market conditions acceptable "
        "to the arranging bank, and execution of definitive financing documentation. Parent makes no representation "
        "that the financing will be consummated on the terms described herein or at all, and the failure to obtain "
        "financing shall NOT constitute a breach of this Agreement by Parent."
    )

    pdf.section("ARTICLE IV: CONDITIONS TO THE MERGER")
    pdf.clause("4.1", "Conditions to Each Party's Obligations", (
        "The respective obligation of each party to effect the Merger is subject to:\n"
        "  (a) Approval by Company stockholders holding at least a majority of outstanding shares;\n"
        "  (b) No governmental authority having enacted any law that prohibits the Merger;\n"
        "  (c) Expiration or termination of the HSR Act waiting period;\n"
        "  (d) CFIUS clearance, if applicable."
    ))
    pdf.clause("4.2", "Additional Conditions to Parent's Obligations",
        # ← HIDDEN CLAUSE 3: Regulatory condition with no effort obligation
        "The obligation of Parent to effect the Merger is also subject to: the accuracy of the Company's "
        "representations and warranties; material compliance by the Company with its covenants; and the absence "
        "of any pending or threatened government action that would have a material adverse impact on the solar "
        "energy sector, including any change to the Investment Tax Credit (ITC) under Section 48 of the Internal "
        "Revenue Code. Parent shall have no obligation to take any action, make any divestiture, or accept any "
        "condition imposed by any governmental authority in connection with obtaining regulatory approvals, "
        "and Parent may terminate this Agreement if any such condition is imposed regardless of whether Parent "
        "has made reasonable efforts to avoid such condition."
    )

    pdf.section("ARTICLE V: TERMINATION")
    pdf.clause("5.1", "Termination Rights", (
        "This Agreement may be terminated at any time prior to the Effective Time:\n"
        "  (a) By mutual written consent of Parent and the Company;\n"
        "  (b) By either party if the Merger has not been consummated by March 31, 2027 (the 'End Date');\n"
        "  (c) By Parent if there has been a breach by the Company of any representation, warranty, or covenant;\n"
        "  (d) By the Company if there has been a breach by Parent of any representation, warranty, or covenant."
    ))
    pdf.clause("5.2", "Termination Fee",
        # ← HIDDEN CLAUSE 4: Asymmetric termination fees
        "In the event of termination:\n"
        "  (a) If this Agreement is terminated by Parent pursuant to Clause 5.1(c), or by the Company for a "
        "Superior Proposal, the Company shall pay to Parent a termination fee of $95,000,000 (the 'Company "
        "Termination Fee'), representing approximately 5.2% of deal value — a market-high rate.\n"
        "  (b) If this Agreement is terminated by the Company pursuant to Clause 5.1(d) due to Parent's "
        "financing failure, Parent shall pay to the Company a reverse termination fee of $28,500,000 "
        "(the 'Reverse Termination Fee'). [RISK: This is the Company's SOLE AND EXCLUSIVE REMEDY against "
        "Parent for any breach, including willful breach and failure to close. The $28.5M cap applies even if "
        "Parent deliberately refuses to close a $1.8B transaction.]\n"
        "  (c) Payment of the applicable termination fee shall be the sole and exclusive remedy of the "
        "recipient party against the paying party for all losses and damages."
    )

    pdf.section("ARTICLE VI: COVENANTS")
    pdf.clause("6.1", "Conduct of Business Prior to Closing", (
        "From the date of this Agreement until the Effective Time, the Company shall conduct its business in the "
        "ordinary course consistent with past practice and shall not, without Parent's prior written consent, "
        "make any material acquisition, incur material indebtedness, or declare any dividends."
    ))
    pdf.clause("6.2", "Non-Solicitation",
        # ← HIDDEN CLAUSE 5: Fiduciary out effectively gutted
        "The Company shall not, and shall instruct its representatives not to, directly or indirectly: "
        "(a) solicit, initiate, or encourage any Acquisition Proposal; "
        "(b) participate in any discussions or negotiations regarding any Acquisition Proposal. "
        "Notwithstanding the foregoing, the Company may engage with an unsolicited third party that has made "
        "a bona fide Acquisition Proposal, PROVIDED THAT such engagement is limited to a period of five (5) "
        "Business Days, after which all communications shall be directed exclusively to Parent. Any information "
        "provided to such third party shall simultaneously be provided to Parent, allowing Parent to match "
        "any Superior Proposal within three (3) Business Days. Parent shall have unlimited matching rights "
        "with no cap on the number of match opportunities."
    )

    pdf.section("ARTICLE VII: GOVERNING LAW")
    pdf.clause("7.1", "Governing Law", (
        "This Agreement shall be governed by the laws of the State of Delaware, without giving effect to any "
        "choice or conflict of law provision or rule."
    ))
    pdf.clause("7.2", "Specific Performance", (
        "The parties agree that irreparable damage would occur if any provision of this Agreement were not performed "
        "in accordance with its terms. Accordingly, the parties shall be entitled to seek specific performance, "
        "subject however to the limitations on remedies set forth in Article V."
    ))

    pdf.add_page()
    pdf.section("SIGNATURE PAGES")
    pdf.body("IN WITNESS WHEREOF, the undersigned parties have caused this Agreement and Plan of Merger to be executed as of the date first written above.")
    pdf.ln(8)
    for entity, role in [
        ("GREENFIELD ENERGY HOLDINGS INC.", "Parent"),
        ("GF MERGER SUBSIDIARY INC.", "Merger Sub"),
        ("SOLARBRIDGE CORPORATION", "Company"),
    ]:
        pdf.set_font("Helvetica", "B", 10)
        pdf.cell(0, 7, entity)
        pdf.ln()
        pdf.set_font("Helvetica", "", 9)
        pdf.cell(0, 6, f"By: ___________________________")
        pdf.ln()
        pdf.cell(0, 6, f"Name: _________________________")
        pdf.ln()
        pdf.cell(0, 6, f"Title: __________________________")
        pdf.ln()
        pdf.cell(0, 6, f"Date: ___________________________")
        pdf.ln(8)

    path = OUTPUT_DIR / "2_GreenField_Merger_Hidden_Clauses.pdf"
    pdf.output(str(path))
    print(f"  Created: {path.name}")


# ══════════════════════════════════════════════════════════════════════════════
# DOCUMENT 3: CLEAN — Asset Purchase Agreement
# ══════════════════════════════════════════════════════════════════════════════

def generate_doc3():
    pdf = LegalPDF("ASSET PURCHASE AGREEMENT — Meridian Foods / FreshBake Bakeries")
    pdf.cover(
        title="ASSET PURCHASE AGREEMENT",
        subtitle="Acquisition of Substantially All Assets of FreshBake Bakeries Private Limited",
        parties=[
            "BUYER: Meridian Foods Group Private Limited",
            "SELLER: FreshBake Bakeries Private Limited",
            "GUARANTOR: Mr. Samuel Okafor (Promoter)",
        ],
        date="October 5, 2026"
    )

    pdf.add_page()
    pdf.section("RECITALS")
    pdf.body(
        "WHEREAS, the Seller desires to sell, transfer, and assign to the Buyer, and the Buyer desires to purchase "
        "and acquire from the Seller, substantially all of the assets of the Seller's bakery and food production "
        "business (the 'Business'), subject to the terms and conditions of this Asset Purchase Agreement.\n\n"
        "This Agreement has been reviewed and negotiated by legal counsel for both parties. All material terms "
        "have been mutually agreed. There are no side letters or undisclosed agreements between the parties."
    )

    pdf.section("ARTICLE 1: DEFINITIONS")
    pdf.clause("1.1", "Defined Terms", (
        '"Acquired Assets" means all assets of the Business listed in Schedule 1.\n'
        '"Assumed Liabilities" means only those liabilities listed in Schedule 2, and no others.\n'
        '"Business Day" means any day other than Saturday, Sunday, or a public holiday in New Delhi.\n'
        '"Closing" means the transfer of the Acquired Assets against payment of the Purchase Price.\n'
        '"Closing Date" means forty-five (45) Business Days after the date of this Agreement, or such other '
        'date as mutually agreed in writing.\n'
        '"Excluded Assets" means cash, accounts receivable older than 90 days, personal assets of the Promoter, '
        'and any asset not specifically listed in Schedule 1.\n'
        '"Excluded Liabilities" means all liabilities of the Seller not listed in Schedule 2, including all '
        'pre-Closing tax liabilities, litigation liabilities, and environmental liabilities.'
    ))

    pdf.section("ARTICLE 2: PURCHASE AND SALE OF ASSETS")
    pdf.clause("2.1", "Sale of Acquired Assets", (
        "On the terms and subject to the conditions of this Agreement, at the Closing, the Seller shall sell, "
        "assign, transfer, and deliver to the Buyer, free and clear of all liens and encumbrances (except those "
        "listed in Schedule 3), all right, title, and interest in and to the Acquired Assets."
    ))
    pdf.clause("2.2", "Assumed Liabilities", (
        "At the Closing, the Buyer shall assume only those liabilities of the Seller that are expressly listed "
        "in Schedule 2 ('Assumed Liabilities'). The Buyer shall not assume, and shall have no liability for, "
        "any Excluded Liabilities, including:\n"
        "  (a) any liability in respect of taxes attributable to periods ending on or before the Closing Date;\n"
        "  (b) any liability arising from any product liability claim relating to products manufactured before Closing;\n"
        "  (c) any contingent liability not disclosed in writing to the Buyer prior to the date hereof;\n"
        "  (d) any liability under pending or threatened litigation, whether or not disclosed."
    ))
    pdf.clause("2.3", "Purchase Price", (
        "The aggregate purchase price for the Acquired Assets is INR 12,50,00,000 (Rupees Twelve Crores Fifty Lakhs), "
        "payable in full on the Closing Date by wire transfer of immediately available funds (the 'Purchase Price'). "
        "There is no earnout, deferred consideration, or contingent payment component."
    ))
    pdf.clause("2.4", "Purchase Price Adjustment", (
        "The Purchase Price shall be subject to a working capital adjustment on the following transparent basis:\n"
        "  (a) A target Net Working Capital of INR 1,20,00,000 has been agreed by the parties.\n"
        "  (b) If the actual Net Working Capital as of the Closing Date is greater than the target, the Purchase Price "
        "shall be increased on a rupee-for-rupee basis.\n"
        "  (c) If the actual Net Working Capital is less than the target, the Purchase Price shall be decreased accordingly.\n"
        "  (d) The working capital calculation methodology is set out in Schedule 5 and was agreed prior to signing."
    ))

    pdf.section("ARTICLE 3: CONDITIONS PRECEDENT")
    pdf.clause("3.1", "Conditions to Buyer's Obligations", (
        "The Buyer's obligation to close is subject to:\n"
        "  (a) All Seller Representations and Warranties being true and correct as of the Closing Date;\n"
        "  (b) The Seller having performed all material covenants;\n"
        "  (c) No Material Adverse Effect having occurred;\n"
        "  (d) All required third-party consents having been obtained (listed exhaustively in Schedule 4);\n"
        "  (e) No governmental authority having issued an injunction prohibiting the transaction;\n"
        "  (f) Title to all Acquired Assets being transferred free and clear of all encumbrances."
    ))
    pdf.clause("3.2", "Conditions to Seller's Obligations", (
        "The Seller's obligation to close is subject to:\n"
        "  (a) All Buyer Representations and Warranties being true and correct in all material respects;\n"
        "  (b) The Buyer having performed all material covenants;\n"
        "  (c) The Buyer having delivered the full Purchase Price."
    ))

    pdf.section("ARTICLE 4: REPRESENTATIONS AND WARRANTIES OF THE SELLER")
    pdf.clause("4.1", "Seller's Warranties", (
        "The Seller and the Guarantor, jointly and severally, represent and warrant to the Buyer that the "
        "statements in Schedule 6 are true and accurate as of the date of this Agreement and as of the Closing Date. "
        "The Seller's Warranties cover: corporate status, financial statements (audited by Deloitte India), "
        "title to assets, material contracts, employee matters, intellectual property, environmental compliance, "
        "and litigation. There are no material qualifications or disclosure carve-outs other than those explicitly "
        "set out in the Disclosure Letter delivered simultaneously with this Agreement."
    ))
    pdf.clause("4.2", "Warranty Claim Limitations", (
        "Claims for breach of Seller Warranties ('Warranty Claims') are subject to the following fair limitations:\n"
        "  (a) De minimis: No individual Warranty Claim shall be brought unless it exceeds INR 5,00,000;\n"
        "  (b) Basket (deductible): No Warranty Claim shall be brought unless the aggregate of all valid claims "
        "exceeds INR 50,00,000, at which point the Buyer may recover all losses including the basket amount;\n"
        "  (c) Cap: The aggregate liability for Warranty Claims is capped at 100% of the Purchase Price "
        "(INR 12,50,00,000), except for fraud or wilful misrepresentation which is uncapped;\n"
        "  (d) Time limit: General Warranty Claims must be notified within 24 months of Closing; "
        "Tax Warranty Claims within 7 years of Closing;\n"
        "  (e) The cap shall not apply to: fundamental warranties (title, capacity), tax warranties, or "
        "fraud-related claims."
    ))

    pdf.section("ARTICLE 5: COVENANTS")
    pdf.clause("5.1", "Conduct Prior to Closing", (
        "From the date of this Agreement through the Closing Date, the Seller shall:\n"
        "  (a) Operate the Business in the ordinary course consistent with past practice;\n"
        "  (b) Preserve existing customer, supplier, and employee relationships;\n"
        "  (c) Not dispose of any Acquired Asset other than inventory sold in the ordinary course;\n"
        "  (d) Promptly notify the Buyer of any Material Adverse Effect or breach of a representation."
    ))
    pdf.clause("5.2", "Non-Compete", (
        "For a period of three (3) years from the Closing Date, the Seller and the Guarantor shall not, "
        "directly or indirectly, engage in the manufacture, distribution, or sale of baked goods or bakery "
        "products within the states of Delhi, Haryana, Uttar Pradesh, and Punjab.\n\n"
        "This restriction applies to the Guarantor in his individual capacity, as a director, employee, "
        "consultant, partner, or shareholder (of more than 5%) in any competing enterprise. "
        "The parties agree this restriction is reasonable in scope, geography, and duration."
    ))
    pdf.clause("5.3", "Employee Matters", (
        "The Buyer shall offer employment to all listed employees in Schedule 7 on terms no less favorable "
        "than their current terms. The Seller shall be responsible for all employee liabilities accrued "
        "up to and including the Closing Date, including unpaid wages, PF/ESI arrears, and gratuity."
    ))
    pdf.clause("5.4", "Tax Covenant", (
        "The Seller shall be solely liable for all taxes relating to the Business for periods ending on or "
        "before the Closing Date. The Seller shall indemnify the Buyer on a pound-for-pound basis (without cap) "
        "for any pre-Closing tax liability assessed on the Buyer after the Closing Date."
    ))

    pdf.section("ARTICLE 6: INDEMNIFICATION")
    pdf.clause("6.1", "Seller Indemnification", (
        "Subject to Article 4.2, the Seller shall indemnify and hold harmless the Buyer from all losses arising from:\n"
        "  (a) any breach of Seller's Representations and Warranties;\n"
        "  (b) any Excluded Liability;\n"
        "  (c) the operation of the Business prior to the Closing Date;\n"
        "  (d) any pre-Closing environmental liability."
    ))
    pdf.clause("6.2", "Buyer Indemnification", (
        "The Buyer shall indemnify and hold harmless the Seller from all losses arising from:\n"
        "  (a) any breach of Buyer's Representations and Warranties;\n"
        "  (b) any Assumed Liability;\n"
        "  (c) the operation of the Business on or after the Closing Date.\n\n"
        "The Buyer's aggregate indemnification liability is capped at 50% of the Purchase Price "
        "(INR 6,25,00,000), except in cases of fraud."
    ))

    pdf.section("ARTICLE 7: MATERIAL ADVERSE EFFECT")
    pdf.clause("7.1", "Definition", (
        "A 'Material Adverse Effect' means any change, effect, or circumstance that is materially adverse to "
        "the financial condition, assets, or results of operations of the Business, taken as a whole."
    ))
    pdf.clause("7.2", "MAC Exclusions (Balanced)", (
        "The following shall not constitute a Material Adverse Effect:\n"
        "  (a) general economic or financial market conditions not disproportionately affecting the Business;\n"
        "  (b) changes in applicable laws or regulations of general applicability;\n"
        "  (c) natural disasters or force majeure events.\n\n"
        "For clarity: loss of a key customer representing more than 15% of revenue, material regulatory action "
        "specific to the Company, or discovery of undisclosed liabilities shall each constitute a Material "
        "Adverse Effect regardless of the above exclusions."
    ))

    pdf.section("ARTICLE 8: TERMINATION")
    pdf.clause("8.1", "Termination Rights", (
        "This Agreement may be terminated prior to Closing by:\n"
        "  (a) mutual written consent;\n"
        "  (b) either party, if Closing has not occurred within 90 days of the date hereof through no fault of "
        "the terminating party;\n"
        "  (c) the Buyer, if there is a material uncured breach of Seller's obligations after 15 days' notice;\n"
        "  (d) the Seller, if there is a material uncured breach of Buyer's obligations after 15 days' notice."
    ))
    pdf.clause("8.2", "Effect of Termination", (
        "If this Agreement is terminated:\n"
        "  (a) Both parties shall bear their own costs and expenses;\n"
        "  (b) Termination shall not relieve any party from liability for fraud or wilful breach;\n"
        "  (c) There is no break fee or termination fee payable by either party under this Agreement.\n"
        "The parties shall have all remedies available at law and in equity for any breach."
    ))

    pdf.section("ARTICLE 9: GOVERNING LAW AND MISCELLANEOUS")
    pdf.clause("9.1", "Governing Law", "This Agreement is governed by the laws of India.")
    pdf.clause("9.2", "Dispute Resolution", (
        "Disputes shall be resolved by arbitration under the Arbitration and Conciliation Act, 1996, "
        "before a sole arbitrator mutually appointed by the parties. Seat: New Delhi. Language: English."
    ))
    pdf.clause("9.3", "Entire Agreement", (
        "This Agreement, together with the Schedules and the Disclosure Letter, constitutes the entire agreement "
        "between the parties with respect to the subject matter hereof. There are no side letters, oral agreements, "
        "or undisclosed arrangements between the parties."
    ))
    pdf.clause("9.4", "Amendments", (
        "No amendment to this Agreement shall be valid unless made in writing and signed by duly authorized "
        "representatives of all parties."
    ))

    pdf.add_page()
    pdf.section("SIGNATURE PAGE")
    pdf.body("IN WITNESS WHEREOF, the parties have executed this Asset Purchase Agreement as of the date first written above.")
    pdf.ln(8)
    for entity, role in [
        ("MERIDIAN FOODS GROUP PRIVATE LIMITED", "Buyer"),
        ("FRESHBAKE BAKERIES PRIVATE LIMITED", "Seller"),
        ("MR. SAMUEL OKAFOR", "Guarantor (in personal capacity)"),
    ]:
        pdf.set_font("Helvetica", "B", 10)
        pdf.cell(0, 7, entity)
        pdf.ln()
        pdf.set_font("Helvetica", "", 9)
        pdf.cell(0, 6, f"By: ___________________________")
        pdf.ln()
        pdf.cell(0, 6, f"Name: _________________________")
        pdf.ln()
        pdf.cell(0, 6, f"Title: __________________________")
        pdf.ln()
        pdf.cell(0, 6, f"Date: ___________________________")
        pdf.ln(8)

    path = OUTPUT_DIR / "3_Clean_Asset_Purchase_Agreement.pdf"
    pdf.output(str(path))
    print(f"  Created: {path.name}")


# ── Main ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("\n Axiom AI — Test Document Generator")
    print(" =====================================")
    print(f" Output directory: {OUTPUT_DIR.resolve()}\n")
    print(" Generating documents...")
    generate_doc1()
    generate_doc2()
    generate_doc3()
    print(f"\n All 3 test documents created in: {OUTPUT_DIR.resolve()}")
    print("\n Document Summary:")
    print("  1_TechAcquire_SPA_Hidden_Clauses.pdf    — HIGH RISK (6 hidden traps)")
    print("  2_GreenField_Merger_Hidden_Clauses.pdf  — HIGH RISK (5 hidden traps)")
    print("  3_Clean_Asset_Purchase_Agreement.pdf    — LOW RISK  (balanced, fair)")
