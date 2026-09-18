-- Phase 7A2.3: replace only the untouched Volume I editorial baseline.
--
-- This migration is intentionally guarded by the complete pre-7A2.3 editorial
-- fields, not by slug or publication status alone. Any later admin edit causes
-- a visible failure before the update begins. Unknown articles are never joined
-- to the payload. The migration is transactionally all-or-nothing.

begin;

create temporary table phase_7a23_journal_payload (
  slug text primary key,
  baseline_title text not null,
  baseline_subtitle text,
  baseline_excerpt text,
  baseline_thesis text,
  baseline_content jsonb not null,
  baseline_key_takeaways jsonb not null,
  baseline_author_role text,
  next_title text not null,
  next_subtitle text,
  next_excerpt text,
  next_thesis text,
  next_content jsonb not null,
  next_key_takeaways jsonb not null,
  next_author_role text
) on commit drop;

insert into phase_7a23_journal_payload (
  slug,
  baseline_title, baseline_subtitle, baseline_excerpt, baseline_thesis,
  baseline_content, baseline_key_takeaways, baseline_author_role,
  next_title, next_subtitle, next_excerpt, next_thesis,
  next_content, next_key_takeaways, next_author_role
) values
  (
    'what-is-a-cannabis-tincture',
    'What Is a Cannabis Tincture?',
    'An Introduction to the Liquid Format, the Dropper, and the Role of the Carrier Oil',
    'Liquid cannabis dispensed with a dropper offers an adaptable alternative to solid formats. Botanica tinctures use coconut MCT oil as the carrier. Here is how the preparation is structured and how it is used.',
    'A cannabis tincture is a liquid format dispensed with a dropper, providing an adaptable alternative to solid preparations through approximate visual reference.',
    jsonb_build_array(
          'A cannabis tincture, within the Botanica collection, is a liquid preparation dispensed in small amounts using a dropper. While cannabis exists in several different forms, the liquid tincture provides an understated alternative to solid preparations. Instead of portioning a solid item, you work with a dark glass bottle fitted with a dropper assembly containing a liquid extract.',
          'Botanica tinctures use coconut MCT oil as the carrier. Disclosing the carrier plainly allows anyone using the bottle to understand the primary liquid medium: cannabis extract carried in coconut MCT oil. The oil serves as the liquid base that allows the extract to be drawn into and dispensed from the dropper.',
          'Dispensing the liquid is accomplished with the dropper assembly fitted into the cap. The current Botanica dropper is unmarked, meaning it does not feature printed measurement lines or numerical graduations. Rather than measuring a laboratory volume, the unmarked dropper can be used as an approximate visual reference. By drawing liquid into the glass tube and noting whether it reaches a quarter, half, three-quarter, or full height, you establish a visible starting point that you can recognize and return to over time.',
          'Once drawn from the bottle, the liquid can be used in two primary ways: held under the tongue or swallowed directly. Holding the drops beneath the tongue allows the liquid to rest in contact with the mouth before swallowing, whereas swallowing directly delivers the oil down into digestion as you would any other liquid. Neither approach requires specialized accessories, allowing the bottle to remain a straightforward addition to your personal space.',
          'Understanding what a tincture is creates the foundation for using it thoughtfully. It is a liquid format using coconut MCT oil as the carrier in an approachable liquid form. By observing how you draw the liquid and deciding whether you prefer to hold or swallow it, you establish an approximate visual baseline for your own routine.'
        ),
    jsonb_build_array(
          'A cannabis tincture is a liquid format dispensed using a dropper.',
          'Botanica tinctures use coconut MCT oil as the carrier.',
          'The current Botanica dropper is unmarked and can be used as an approximate visual reference.',
          'Drops can be held under the tongue or swallowed directly.'
        ),
    'Apothecary Journal',
    'What Is a Cannabis Tincture?',
    'A clear guide to the liquid format, bottle, dropper, and carrier oil',
    'A tincture is a liquid cannabis product that comes in a bottle with a dropper. This article explains Botanica''s coconut MCT oil carrier and the dropper''s approximate visual levels.',
    'A cannabis tincture is a liquid product in a dropper bottle. Its unmarked dropper gives an approximate visual reference, not an exact measurement.',
    jsonb_build_array(
          'A cannabis tincture is a liquid cannabis product that comes in a bottle with a dropper. Instead of a solid piece, the bottle holds a liquid extract that you draw into the glass tube.',
          'Botanica tinctures use coconut MCT oil as the carrier. The carrier is the liquid base that holds the extract and lets it move through the bottle and dropper.',
          'The current Botanica dropper has no printed lines or numbers. You can compare the liquid level with four approximate visual points: quarter, half, three-quarter, and full. These are visual references, not measured amounts.',
          'After drawing the liquid, it can be held under the tongue or swallowed directly. These are two ways to use the same liquid format. The timing can differ from person to person.',
          'Knowing the bottle, carrier oil, and dropper makes the tincture format easier to understand. The visual guide is only an approximate reference because the dropper is unmarked.'
        ),
    jsonb_build_array(
          'A tincture is a liquid cannabis product in a bottle with a dropper.',
          'Botanica tinctures use coconut MCT oil as the carrier.',
          'The dropper is unmarked, so visual levels are approximate.',
          'Quarter, half, three-quarter, and full are visual reference points.',
          'The liquid may be held under the tongue or swallowed directly.'
        ),
    'Botanica Editorial'
  ),
  (
    'from-edibles-to-drops',
    'From Edibles to Drops: What Actually Changes?',
    'Comparing Familiar Fixed Portions With the Flexibility of a Liquid Visual Draw',
    'Solid edibles provide a familiar fixed portion. Tinctures offer a different kind of control based on visible liquid volume. Understanding these format characteristics helps you choose what fits your routine.',
    'Moving from a solid edible to a liquid tincture introduces a different kind of control from a familiar fixed edible portion, without either format being inherently superior.',
    jsonb_build_array(
          'For many people, the first introduction to non-inhaled cannabis comes through solid edibles. Edibles are solid cannabis formats that often take the form of gummies, baked goods, or other confections. These preparations are familiar because they arrive as pre-divided units. You take a single piece or divide one in half, consume it like ordinary food, and proceed with your evening. The solid format provides a sense of certainty because each piece represents a pre-formed unit.',
          'Transitioning to a liquid tincture introduces a different kind of control from a familiar fixed edible portion. Instead of choosing between a whole piece or dividing a confection into irregular pieces, a tincture allows you to gauge liquid height directly in a glass tube. While a pre-formed edible is set in its manufactured shape, a liquid can be raised or lowered to approximate visual benchmarks -- a quarter, a half, or a full draw -- giving you room to make visual adjustments without physically cutting a piece of food.',
          'This shift in physical medium also changes the practical handling of the product. Edibles are solid items that require chewing and ingestion as food. A tincture, by contrast, is an oil-based liquid. Botanica tinctures use coconut MCT oil as the carrier.',
          'Furthermore, liquid drops provide different options for how the preparation is taken. A solid edible is chewed and swallowed, meaning it moves directly into digestion. Drops provide the choice to either swallow the oil directly or hold it briefly beneath the tongue before swallowing. This dual pathway gives the liquid format a different practical rhythm, allowing you to explore distinct administration options with the same bottle.',
          'Neither format is universally superior. An edible remains a convenient option when you want a familiar fixed portion that requires no visual estimation. A tincture provides a liquid format with approximate visual references in the dropper and the choice between holding or swallowing. Recognizing these practical distinctions allows you to select the format whose characteristics fit your personal routine.'
        ),
    jsonb_build_array(
          'Edibles are solid cannabis formats that often take the form of gummies, baked goods, or other confections.',
          'Tinctures offer a different kind of control from a familiar fixed edible portion via visible liquid volume.',
          'Liquid drops can be held under the tongue or swallowed directly.',
          'Neither format is universally superior; each serves distinct lifestyle preferences.'
        ),
    'Apothecary Journal',
    'Tinctures and Edibles: What Changes?',
    'A simple comparison of solid portions and liquid drops',
    'Edibles are solid products that come in set pieces. Tinctures are liquids that use a dropper and approximate visual levels. This article compares the two formats without treating one as better.',
    'Edibles and tinctures have different physical formats. Edibles come in set pieces, while tinctures use an unmarked dropper and approximate liquid levels.',
    jsonb_build_array(
          'Edibles are solid cannabis products, such as gummies or baked goods. They come as separate pieces or portions in a familiar food format.',
          'A tincture is a liquid in a bottle. Its unmarked dropper lets you compare the liquid with approximate quarter, half, three-quarter, or full levels. These levels are visual references, not exact measurements.',
          'The two formats are handled differently. An edible is a solid piece that is chewed and swallowed. A tincture is an oil-based liquid. Botanica tinctures use coconut MCT oil as the carrier.',
          'Liquid drops can be held under the tongue or swallowed directly. An edible is swallowed as food. These are practical format differences, and the timing of an experience can vary.',
          'Neither format is always better. An edible offers a set solid portion. A tincture offers a liquid format with an unmarked dropper and approximate visual levels.'
        ),
    jsonb_build_array(
          'Edibles are solid cannabis products that come in separate pieces.',
          'Tinctures are liquids in bottles with unmarked droppers.',
          'Tincture fill levels are approximate visual references.',
          'Drops may be held under the tongue or swallowed directly.',
          'The two formats have different handling and timing.'
        ),
    'Botanica Editorial'
  ),
  (
    'understanding-the-visual-draw',
    'Understanding the Visual Draw',
    'Navigating an Unmarked Dropper Through Approximate Fill Heights',
    'The current Botanica dropper is unmarked. By using quarter, half, three-quarter, and full fill heights as approximate visual references, you can establish a consistent baseline.',
    'The current Botanica dropper is unmarked, meaning consistent personal routines rely on approximate visual references rather than calibrated lines.',
    jsonb_build_array(
          'When opening a bottle of Botanica tincture, one of the first physical details you notice is the pipette itself. The current Botanica dropper is unmarked. There are no printed graduation lines, no milliliter numbers etched into the glass, and no markings to indicate a measured stopping point. Because of this, using the dropper requires learning how to gauge liquid height by sight.',
          'Visual levels are approximate. They are not calibrated volume markings. Attempting to treat an unmarked apothecary pipette as an analytical measuring tool is not practical, because liquid drawn into a handheld glass tube can fluctuate from one draw to the next. What is useful for a personal routine is establishing a recognizable, similar visual reference that you can observe and repeat.',
          'To make this practical, you can view the glass tube in four general sections. A quarter visual draw fills the lower section of the tube above the tapered tip. A half visual draw brings the oil roughly to the midpoint of the visible glass cylinder. A three-quarter visual draw covers most of the tube, and a full visual draw fills the main column toward the top of the glass shaft. These four levels provide intuitive visual benchmarks.',
          'Before use, compare the visible liquid height with the approximate visual reference you intended. The goal is visual similarity, not measured volume.',
          'Relying on an approximate visual draw allows you to work with visible liquid volume rather than printed lines. Keeping your visual reference consistent across comparable experiences provides an observable reference point you can use to evaluate your routine over time.'
        ),
    jsonb_build_array(
          'The current Botanica dropper is unmarked.',
          'Visual levels are approximate. They are not calibrated volume markings.',
          'Quarter, half, three-quarter, and full fill heights serve as approximate visual references.',
          'Consistency comes from returning to a similar visual reference over time.'
        ),
    'Apothecary Journal',
    'How to Read the Dropper Guide',
    'How to compare quarter, half, three-quarter, and full liquid levels',
    'Botanica''s dropper has no printed marks. This guide explains how to compare quarter, half, three-quarter, and full liquid levels as approximate visual references.',
    'The Botanica dropper is unmarked. Quarter, half, three-quarter, and full levels are approximate visual references, not calibrated measurements.',
    jsonb_build_array(
          'The Botanica dropper has no printed lines or numbers. Because it is unmarked, the liquid level must be compared by sight.',
          'The visual levels are approximate. They are not calibrated volume markings, and the liquid level can vary between draws. The guide is meant to help you recognize a similar visual level, not to measure an exact amount.',
          'The glass tube can be viewed in four general sections. A quarter level fills the lower part above the tip. A half level reaches about the middle. A three-quarter level covers most of the tube. A full level reaches the main upper part of the tube.',
          'Before using the guide, compare the liquid height with the visual reference you want to recognize. The goal is visual similarity, not an exact measurement.',
          'An unmarked dropper has limits. Returning to a similar visual reference can help you describe and compare your own observations, but it does not turn the dropper into a measuring tool.'
        ),
    jsonb_build_array(
          'The Botanica dropper has no printed marks.',
          'Visual levels are approximate, not calibrated measurements.',
          'Quarter, half, three-quarter, and full are general visual levels.',
          'The guide helps you compare liquid height by sight.'
        ),
    'Botanica Editorial'
  ),
  (
    '25mg-vs-50mg-what-bottle-strength-means',
    '25 mg vs 50 mg: What Bottle Strength Means',
    'Translating Calculated Bottle Strength Into Approximate Draw References',
    'Bottle strength represents the calculated total content across a 10 ml volume. Understanding these numbers provides a calculated reference for approximate visual draws.',
    'Stated bottle strength indicates calculated cannabinoid content across a 10 ml volume, providing an arithmetic reference rather than laboratory-verified dose measurements.',
    jsonb_build_array(
          'When reading a tincture label, the prominent number displayed is the total milligram strength -- such as 25 mg or 50 mg. For someone new to liquid preparations, it is important to understand what this number represents. The stated strength does not describe what is contained in a single dropper draw. The Botanica calculation treats 25 mg or 50 mg as the calculated bottle-strength reference for the 10 ml bottle.',
          'Because the bottle contains 10 ml of liquid, understanding individual visual draws uses a simple arithmetic model. In this calculation model, a full visual draw of the dropper is used as an approximate 1 ml arithmetic reference. Dividing the total calculated reference of the bottle across ten theoretical 1 ml draws allows us to establish approximate calculated references for each fractional visual level.',
          'For a 50 mg bottle in a 10 ml volume, the calculated reference values break down as follows: a quarter visual draw corresponds to the calculated reference of approximately 1.25 mg; a half visual draw corresponds to the calculated reference of approximately 2.5 mg; a three-quarter visual draw corresponds to the calculated reference of approximately 3.75 mg; and a full visual draw corresponds to the calculated reference of approximately 5 mg. Under this arithmetic model, each visual benchmark represents a fraction of the bottle''s total calculated content.',
          'For a 25 mg bottle in a 10 ml volume, the calculated values represent half that concentration across the same volume: a quarter visual draw corresponds to the calculated reference of approximately 0.625 mg; a half visual draw corresponds to the calculated reference of approximately 1.25 mg; a three-quarter visual draw corresponds to the calculated reference of approximately 1.875 mg; and a full visual draw corresponds to the calculated reference of approximately 2.5 mg. Comparing the two models shows that a full visual draw of the 25 mg bottle corresponds to roughly the same calculated reference as a half visual draw of the 50 mg bottle.',
          'These values are calculated references, not laboratory-verified dose measurements. Because the physical Botanica dropper is unmarked, your actual fill height will be an approximate visual estimate. Stated milligram numbers exist to help you understand the relative calculated strength of the bottle, providing an arithmetic reference rather than an exact measurement.',
          'In practical terms, 50 mg represents twice the calculated bottle-strength reference of 25 mg across the same 10 ml bottle size. Understanding this proportional difference allows you to interpret label numbers as arithmetic references and evaluate visual fill levels independently.'
        ),
    jsonb_build_array(
          'The Botanica calculation treats 25 mg or 50 mg as the calculated bottle-strength reference for the 10 ml bottle.',
          'The arithmetic model uses a full visual draw as an approximate 1 ml reference.',
          'These values are calculated references, not laboratory-verified dose measurements.',
          '50 mg represents twice the calculated bottle-strength reference of 25 mg across the same 10 ml bottle size.'
        ),
    'Apothecary Journal',
    'What 25 mg and 50 mg Mean',
    'A plain guide to total THC, bottle size, and approximate visual references',
    'The 25 mg and 50 mg labels describe the total THC in a 10 ml bottle. This article explains the current arithmetic references without giving personal dosing advice.',
    'The 25 mg and 50 mg labels describe total THC in a 10 ml bottle. Any visual draw comparison is an approximate arithmetic reference, not a personal dose instruction.',
    jsonb_build_array(
          'The number on a tincture bottle describes the total THC in the bottle. Botanica''s current bottles are 10 ml. One bottle contains 25 mg THC total, and the other contains 50 mg THC total.',
          'The 25 mg bottle is the lower-strength bottle in the current Botanica range. The 50 mg bottle is the higher-strength bottle. The numbers describe the total bottle strength; they do not describe one exact dropper draw.',
          'The current calculator uses a full visual draw as an approximate 1 ml reference. It then divides the bottle total across ten theoretical 1 ml portions. This is an arithmetic model based on the bottle size and total strength.',
          'In that model, a 50 mg bottle has approximate references of 1.25 mg at a quarter, 2.5 mg at a half, 3.75 mg at three-quarter, and 5 mg at a full visual draw. A 25 mg bottle has approximate references of 0.625 mg, 1.25 mg, 1.875 mg, and 2.5 mg at those same visual levels.',
          'These values are calculated references, not exact measurements. The dropper is unmarked, so the actual liquid level can vary. The guide explains the numbers; it does not tell you what amount to use.'
        ),
    jsonb_build_array(
          'The 25 mg bottle contains 25 mg THC total in 10 ml.',
          'The 50 mg bottle contains 50 mg THC total in 10 ml.',
          '25 mg is the lower-strength bottle and 50 mg is the higher-strength bottle in the current range.',
          'Visual draw calculations are approximate arithmetic references.',
          'The guide does not provide personal dosing advice.'
        ),
    'Botanica Editorial'
  ),
  (
    'two-routes-different-timing',
    'Two Routes. Different Timing.',
    'The Qualitative Differences Between Holding Drops Under the Tongue and Swallowing',
    'Tinctures offer two primary routes: held under the tongue or swallowed directly. Each route unfolds with its own qualitative pace and timing.',
    'Choosing between holding drops under the tongue and swallowing introduces natural, qualitative differences in experienced timing.',
    jsonb_build_array(
          'A distinct characteristic of liquid cannabis tinctures is that they offer more than one method of administration. When you dispense drops from the pipette, you have two primary routes available: you can hold the liquid under your tongue, or you can swallow it directly. While both methods utilize the same bottle of oil, they involve different administration routes and result in qualitative differences in timing.',
          'The first option is holding drops under the tongue before swallowing the remaining liquid. The area beneath the tongue allows the oil to rest in contact with oral tissue. Because of this contact, under-the-tongue use may feel noticeable sooner for some people. How quickly this occurs varies between individuals, but holding the drops generally represents a different experiential pace than swallowing them immediately.',
          'The second option is swallowing the drops directly. When you swallow the oil, the liquid moves down into the stomach. Swallowed use passes through digestion and may take longer to feel.',
          'Because individual timing varies naturally, there is no fixed rule for how long someone should hold drops under the tongue, nor is one route universally preferred over the other. Some individuals prefer holding drops under the tongue, while others find swallowing directly to be simpler and more convenient for their routine.',
          'You can observe these qualitative differences by exploring each route separately. Keeping your approximate visual draw similar while trying one route on one occasion and the other route on a later occasion allows you to observe how each method develops for you. Noting these differences helps you decide which route aligns better with your evening.'
        ),
    jsonb_build_array(
          'Tinctures offer two primary routes: held under the tongue or swallowed directly.',
          'Under-the-tongue use may feel noticeable sooner for some people.',
          'Swallowed use passes through digestion and may take longer to feel.',
          'Timing varies naturally; neither route is universally preferred.'
        ),
    'Apothecary Journal',
    'Holding Drops Under the Tongue or Swallowing',
    'The two ways to use a tincture and why timing can vary',
    'Tinctures can be held under the tongue or swallowed directly. This article describes the two routes and explains that timing can vary between people.',
    'A tincture can be held under the tongue or swallowed directly. The route is different, and timing is not the same for everyone.',
    jsonb_build_array(
          'A tincture offers two ways to use the liquid. The drops can be held under the tongue before swallowing, or they can be swallowed directly.',
          'When drops are held under the tongue, the liquid stays in contact with the area beneath the tongue before it is swallowed. This route can have a different timing pattern from swallowing the liquid right away.',
          'When drops are swallowed directly, the liquid moves into digestion. This is another timing pattern, and the exact timing can vary between people.',
          'There is no fixed timing rule in this guide, and neither route is presented as universally better. The article only describes the difference between the two routes and the fact that personal timing varies.',
          'Keeping the route clear when writing about an experience can help separate one observation from another. It does not make the result predictable.'
        ),
    jsonb_build_array(
          'Tincture drops can be held under the tongue or swallowed directly.',
          'The two routes have different paths through the body.',
          'Timing can vary between people.',
          'Neither route is presented as universally better.',
          'The guide gives no fixed timing rule.'
        ),
    'Botanica Editorial'
  ),
  (
    'why-the-same-draw-can-feel-different',
    'Why the Same Draw Can Feel Different',
    'Understanding the Everyday Context That Shapes Your Experience',
    'A similar visual draw does not guarantee an identical evening. Everyday context -- such as recent meals and personal familiarity -- influences how the experience develops.',
    'Everyday personal factors -- such as recent food, route of use, and familiarity -- naturally influence how the experience develops from a similar visual draw.',
    jsonb_build_array(
          'A common occurrence when using a cannabis tincture is taking a similar visual draw from the same bottle on two separate occasions and finding that the experience feels different. On one occasion, a half draw may seem subtle and slow to develop. On another occasion, that same visual height might feel more pronounced. Several factors can contribute to a different experience.',
          'Everyday context shapes how an experience develops. Whether food was recent can be useful context when comparing experiences. Observing whether a meal was recent helps contextualize personal observations across different occasions.',
          'The route of administration is another contributing factor. Differences in how long drops are held under the tongue, or swallowing them more quickly than on a previous occasion, will alter the path the oil takes. Shifting between holding and swallowing introduces different timing, which can change how noticeable the initial onset feels.',
          'Individual background and previous cannabis experience also provide context. Frequency of use and personal familiarity may simply be recorded as context alongside your other observations.',
          'Finally, immediate surroundings influence perception. Experiencing cannabis in a quiet setting with few distractions allows you to notice subtle sensory impressions that might be overlooked in a busy environment. A different experience does not, by itself, tell you which variable changed. By observing recent food, administration route, and setting, you can evaluate differences without jumping to conclusions.'
        ),
    jsonb_build_array(
          'Several factors can contribute to a different experience from a similar visual draw.',
          'Whether food was recent can be useful context when comparing experiences.',
          'Differences in administration route influence experienced timing.',
          'A different experience does not, by itself, tell you which variable changed.'
        ),
    'Apothecary Journal',
    'Why the Same Visual Draw Can Differ',
    'How food, route, setting, and familiarity can add context',
    'The same visual draw can feel different on different occasions. This article reviews food, route, setting, and familiarity as possible context for comparing observations.',
    'A similar visual draw does not guarantee the same experience. Food, route, setting, and familiarity can provide context when observations differ.',
    jsonb_build_array(
          'A similar visual draw from the same bottle can feel different on two occasions. The draw may look the same, but the surrounding conditions may not be the same.',
          'Recent food can be one part of that context. Writing down whether a meal was recent can make two observations easier to compare. The note does not explain the result by itself.',
          'The route can also differ. Holding drops under the tongue and swallowing them directly are not the same route. A change in route can mean a change in timing.',
          'Personal familiarity and frequency of use are more context to record. They describe what was different about the occasion, but they do not predict a particular outcome.',
          'Setting matters to what a person notices. A busy place and a quiet place may lead to different observations. A difference alone does not show which factor caused it.'
        ),
    jsonb_build_array(
          'A similar visual draw does not guarantee the same experience.',
          'Recent food can be recorded as context.',
          'The route can change the timing of an experience.',
          'Familiarity and setting can also be recorded as context.',
          'One difference does not prove what caused the change.'
        ),
    'Botanica Editorial'
  ),
  (
    'circadian-tincture-chronobiology',
    'Why Timing Matters More Than Chasing Strength',
    'Why Keeping Variables Stable Gives You a Clearer Basis for Comparison',
    'When an experience feels subtle, the instinct is often to seek a stronger bottle. Keeping the visual draw, route, and setting similar gives you a clearer basis for comparison.',
    'Keeping the visual draw, route, and setting similar gives you a clearer basis for comparison than repeatedly increasing bottle strength.',
    jsonb_build_array(
          'When an initial experience with cannabis feels subtle, an immediate impulse is often to change bottle strength. In an environment where potency figures are prominently displayed, it is easy to assume that if an experience was understated, the answer must be to switch to a higher concentration. Yet changing strength repeatedly often makes comparison harder.',
          'A central principle of thoughtful observation is that keeping the visual draw, route, and setting similar gives you a clearer basis for comparison. When you alter the strength of your bottle or change the liquid volume from one session to the next, you introduce a new variable before you understand the previous one. This makes it difficult to determine whether an outcome was shaped by your evening context or by the shift in product strength.',
          'Consistency provides the reference frame necessary for personal observation. If you maintain an approximate visual draw under similar evening conditions across comparable experiences, you create a basis for comparison. You give yourself the opportunity to observe whether an experience was influenced by everyday factors such as recent food or personal setting, rather than assuming the bottle strength was insufficient.',
          'Setting also contributes to clear observation. In a busy environment with competing demands, attention is divided. A quieter setting may make comparison easier because fewer variables compete for attention, allowing you to observe the experience without unnecessary distraction.',
          'Adjusting one variable at a time remains a practical approach. Before deciding to alter bottle strength, consider keeping your visual draw, administration route, and general conditions similar. By prioritizing consistent reference points over frequent changes in strength, you develop a clearer understanding of your personal preferences.'
        ),
    jsonb_build_array(
          'Changing strength repeatedly makes personal comparison harder.',
          'Keeping the visual draw, route, and setting similar gives you a clearer basis for comparison.',
          'A quieter setting makes comparison easier because fewer variables compete for attention.',
          'Adjust one personal variable at a time before deciding to change bottle strength.'
        ),
    'Apothecary Journal',
    'Why Consistency Makes Comparison Easier',
    'How keeping the draw, route, and setting similar can help you compare observations',
    'Changing bottle strength, liquid level, route, and setting at the same time makes comparison difficult. This article explains why keeping conditions similar gives clearer context.',
    'Keeping the visual draw, route, and setting similar gives a clearer basis for comparison than changing several things at once.',
    jsonb_build_array(
          'When an experience seems subtle, changing to a different bottle may seem like the next step. But changing the bottle also changes one of the conditions you are trying to understand.',
          'Keeping the visual draw, route, and setting similar makes comparison easier. If several conditions change at once, it is hard to know which change shaped the observation.',
          'An approximate visual reference can provide one point of comparison. Recent food, personal setting, and route can provide other context. These notes do not guarantee the same experience each time.',
          'A quieter setting can make it easier to notice what happened because there are fewer distractions. This is a statement about the setting, not a promise about the product.',
          'Changing one condition at a time gives each observation a clearer comparison point. The article does not recommend a bottle strength or a personal amount.'
        ),
    jsonb_build_array(
          'Changing several conditions at once makes comparison difficult.',
          'A similar visual draw, route, and setting give clearer context.',
          'An approximate visual reference is not an exact measurement.',
          'A setting with fewer distractions may make observations easier to record.',
          'The article does not recommend a strength or personal amount.'
        ),
    'Botanica Editorial'
  ),
  (
    'give-it-time-why-patience-matters',
    'Give It Time: Why Patience Matters',
    'Why Mid-Session Adjustments Make Comparison Harder',
    'Adding more before you understand the first experience makes comparison harder. Giving the initial draw adequate time allows you to evaluate your baseline clearly.',
    'Adding more before you understand the first experience makes comparison harder.',
    jsonb_build_array(
          'Patience is an essential consideration when using liquid cannabis tinctures. Because tinctures develop gradually, there is often an interval after taking drops where very little seems to be happening. During this period, it is common to wonder whether the draw was sufficient and to consider taking an additional amount.',
          'Adding more before you understand the first experience makes comparison harder. When you take a visual draw and soon decide to take another, you combine two separate events. As the second draw begins to develop alongside the first, it becomes difficult to determine which draw produced the eventual feeling or how much liquid was responsible.',
          'Taking additional drops mid-session complicates your ability to learn from the experience. If the combined outcome feels more pronounced than you intended, you cannot know whether the initial draw would have been comfortable on its own had you waited. If you find the outcome comfortable, you still do not know whether the second draw was needed. In either case, your reference point is obscured.',
          'The practical alternative is to give the experience adequate time before changing another variable in a later experience. Treating an initial draw as a distinct observation allows you to assess that specific visual height, route, and context without confounding variables.',
          'Carrying that observation into a later experience allows you to make comparisons with clarity. If you later change a variable, knowing which variable changed makes comparison clearer. Giving each experience adequate time supports an unhurried, understandable routine.'
        ),
    jsonb_build_array(
          'Cannabis tinctures develop gradually and require unhurried patience.',
          'Adding more before you understand the first experience makes comparison harder.',
          'Mid-session adjustments obscure which draw was responsible for the outcome.',
          'Give the experience adequate time before changing another variable in a later experience.'
        ),
    'Apothecary Journal',
    'Why Mid-Session Changes Make Comparison Harder',
    'How changing more than one draw can make an observation unclear',
    'Making another change before the first experience is clear can combine two separate events. This article explains why that makes comparison harder without giving a timing or dosing rule.',
    'When two visual draws are combined in one session, it becomes harder to tell what each draw contributed to the observation.',
    jsonb_build_array(
          'The timing of a tincture experience can vary. When the first draw does not seem clear right away, it may be hard to know what to record.',
          'Making another change in the same session combines two separate events. It then becomes difficult to tell which draw contributed to the later observation.',
          'This also makes the original visual reference harder to compare. You cannot separate the first draw from the later change when both are part of the same observation.',
          'The useful point is not a fixed waiting time. It is that changing more than one thing in one session makes the record less clear.',
          'Keeping each observation separate can make a later comparison easier. This article does not tell anyone how much to use or when to use it.'
        ),
    jsonb_build_array(
          'Tincture timing can vary between people and occasions.',
          'Two changes in one session can combine separate observations.',
          'A combined observation makes the visual reference harder to compare.',
          'This article gives no fixed waiting time or amount.',
          'Keeping observations separate makes later comparison clearer.'
        ),
    'Botanica Editorial'
  ),
  (
    'how-to-build-a-repeatable-cannabis-routine',
    'How to Build a Repeatable Cannabis Routine',
    'Creating a Clearer Basis for Comparison in Your Evening Habits',
    'Establishing a repeatable routine is about creating a clearer basis for comparison. By keeping your visual draw, route, and setting familiar, you can better understand your preferences.',
    'A repeatable routine is about keeping your chosen personal conditions consistent, creating a clearer basis for comparison without guaranteeing identical outcomes.',
    jsonb_build_array(
          'Building a routine around cannabis is sometimes misunderstood as an attempt to guarantee identical outcomes every time. In practice, personal conditions and everyday contexts vary naturally. Establishing a repeatable routine is about repeatable conditions, not predictable effects. Keeping your personal habits consistent establishes a clearer comparison point over time.',
          'A foundational element of a consistent routine is your visual draw. Because the Botanica dropper is unmarked, consistency begins with selecting a chosen approximate visual reference and returning to that benchmark across sessions. Drawing liquid to a similar visual height in the glass tube provides a similar visual reference for comparison.',
          'A second element is your administration route. Holding drops under the tongue and swallowing them directly can differ in timing. Choosing one method and keeping it consistent allows you to become familiar with its particular timing and characteristics before altering other factors.',
          'A third element is your setting and evening timing. A routine benefits from clear personal boundaries, such as using drops only after professional obligations are finished and daily tasks are set aside. When your physical setting is familiar and free of immediate demands, you have a calmer environment in which to observe your experience.',
          'A repeatable routine does not require rigid scheduling or mandatory daily use. It is simply a consistent framework you can return to whenever you choose to use a tincture. When your conditions remain similar, you maintain personal agency and a clearer basis for comparison.'
        ),
    jsonb_build_array(
          'A repeatable routine relies on repeatable conditions, not predictable effects.',
          'Anchor your routine around a chosen approximate visual reference, route, and setting.',
          'Consistent conditions create a clearer comparison point across different sessions.',
          'Routines should remain flexible and supportive, without rigid rules or mandatory schedules.'
        ),
    'Apothecary Journal',
    'How to Keep a Consistent Tincture Routine',
    'A simple way to keep visual level, route, and setting clear',
    'A consistent routine does not promise the same result every time. It keeps the visual level, route, and setting easier to compare when you make personal notes.',
    'A consistent routine means keeping chosen conditions similar for comparison. It does not guarantee the same result every time.',
    jsonb_build_array(
          'A consistent routine is not a promise of the same result every time. It is a way to keep some conditions similar when you compare personal observations.',
          'The first condition is the visual level. Because the Botanica dropper is unmarked, a quarter, half, three-quarter, or full level is only an approximate visual reference.',
          'The second condition is the route. Drops can be held under the tongue or swallowed directly. Keeping the route clear in your notes helps show whether the route changed.',
          'The third condition is the setting and time of day. Finishing work and other duties before private personal time can make the context easier to describe. Do not drive or operate machinery after THC use.',
          'A routine does not need a rigid schedule or daily use. It is simply a set of conditions you can describe when you choose to write about an observation.'
        ),
    jsonb_build_array(
          'A consistent routine does not guarantee the same result.',
          'Visual levels from an unmarked dropper are approximate.',
          'The route should be clear in personal notes.',
          'Setting and time of day add context to an observation.',
          'Do not drive or operate machinery after THC use.'
        ),
    'Botanica Editorial'
  ),
  (
    'how-to-compare-one-experience-with-another',
    'How to Compare One Experience With Another',
    'Simple Field Notes for Personal Reflection Without Clinical Scoring',
    'You do not need clinical charts or complex scoring systems to evaluate your routine. A few brief notes on visual draw, route, and setting provide practical clarity.',
    'Keeping brief, qualitative notes on visual draw, route, and setting helps you compare personal experiences without clinical scoring or dosage optimization.',
    jsonb_build_array(
          'When exploring a tincture, keeping a brief personal record can provide helpful clarity. However, personal notes do not need to resemble clinical charts, complex symptom logs, or numerical rating systems. The purpose of field notes is simply to record qualitative observations that help you compare personal experiences over time.',
          'A practical field note can be recorded in a notebook in less than a minute. Rather than scoring sensations numerically or attempting to calculate physiological metrics, focus on five descriptive touchpoints:',
          'First, record the bottle strength and approximate visual draw you used. Second, record your administration route, noting whether you held the drops under your tongue or swallowed them directly. Third, note your general setting, such as relaxing at home or reading. Fourth, note whether food was recent, as this provides useful context for timing. Finally, write a brief sentence capturing your general personal impression.',
          'Keeping observations brief and descriptive helps maintain a relaxed ritual. Numerical scales can create pressure to evaluate an experience analytically. Your notes exist to support your own memory and reflection, not to generate medical data or optimize a clinical dose.',
          'Over time, reviewing these brief notes can help you recognize personal patterns. You may find that a particular visual reference or route fits your evening routine better than another. Simple field notes provide descriptive context to help you navigate your routine with confidence.'
        ),
    jsonb_build_array(
          'Field notes are descriptive aids for personal reflection, not medical records.',
          'Record five basic touchpoints: visual draw, route, setting, recent food, and general impression.',
          'Avoid numerical ratings, scoring systems, or attempts to optimize a clinical dose.',
          'Qualitative notes help you identify personal preferences across different sessions.'
        ),
    'Apothecary Journal',
    'How to Compare Tincture Experiences',
    'Simple personal notes about visual level, route, food, and setting',
    'Brief notes can help you compare personal observations without turning them into medical records or a dosing plan. This article lists the context worth recording.',
    'Brief descriptive notes can help compare personal observations without clinical scoring or personal dosing advice.',
    jsonb_build_array(
          'A short personal record can make two tincture observations easier to compare. It does not need to look like a medical chart or use a scoring system.',
          'Record the bottle strength and the approximate visual level. Also record the route: held under the tongue or swallowed directly.',
          'Write down the setting and whether food was recent. These details give context to the observation, but they do not predict what will happen.',
          'End with a short description of what you noticed. Use ordinary words instead of numbers or medical measurements.',
          'These notes support memory and comparison. They are not medical records and are not a way to calculate a personal amount.'
        ),
    jsonb_build_array(
          'Brief notes can help compare personal observations.',
          'Record bottle strength and an approximate visual level.',
          'Record the route, setting, and whether food was recent.',
          'Use descriptive words instead of medical scoring.',
          'Notes are not medical records or a personal dosing plan.'
        ),
    'Botanica Editorial'
  ),
  (
    'cannabis-after-the-day-is-done',
    'Cannabis After the Day Is Done',
    'Establishing a Clear Cultural Boundary for Evening Personal Time',
    'Botanica places cannabis after professional responsibilities and within private personal time. Setting this intentional boundary marks a clear transition into the evening.',
    'Botanica places cannabis after professional responsibilities and within private personal time, establishing a deliberate boundary at the close of the day.',
    jsonb_build_array(
          'Discussions around cannabis often describe it as an accompaniment for daily activities and professional tasks. Botanica takes a distinct view. Botanica chooses to place cannabis after professional responsibilities and within private personal time. We consider cannabis most appropriate not as a tool for workplace performance, but as an intentional boundary marking the conclusion of the working day.',
          'Modern working life frequently blurs the line between professional obligations and personal time. With portable technology and ongoing communication, work tasks can easily spill into the evening. Introducing cannabis while still managing workplace responsibilities or addressing professional correspondence compromises your attention. Keeping cannabis outside working hours ensures that professional obligations receive your undivided focus.',
          'Establishing this boundary involves concluding your responsibilities before opening a bottle. When work tasks are completed, practical errands are finished, and domestic duties are managed, using a tincture becomes a deliberate transition. It marks an intentional division: the time dedicated to work is complete, and the hours reserved for personal time and private life have begun.',
          'This evening boundary also involves essential safety considerations. Cannabis should be used within private personal spaces where no further travel is required. Do not drive or operate machinery after THC use. Ensuring that transit is completed and that you are settled at home allows you to spend your evening responsibly, in accordance with local laws and workplace policies.',
          'By maintaining this separation, you protect the focus required for professional duties and the boundary of your personal time. Placed thoughtfully at the end of the day, an apothecary tincture serves as a quiet marker for the start of your evening.'
        ),
    jsonb_build_array(
          'Botanica places cannabis after professional responsibilities and within private personal time.',
          'Cannabis is positioned as an evening boundary, not a tool for workplace performance.',
          'Conclude professional obligations and domestic duties before your evening routine.',
          'Always consume responsibly: do not drive or operate machinery after THC use.'
        ),
    'Apothecary Journal',
    'Cannabis and Personal Time',
    'Why Botanica places cannabis after work, travel, and daily duties',
    'Botanica places cannabis in private personal time, after work and travel duties are complete. This article explains that boundary and the related safety reminder.',
    'Botanica places cannabis after professional and travel responsibilities, within private personal time.',
    jsonb_build_array(
          'Botanica places cannabis after work and other professional responsibilities. It is described as part of private personal time, not as a tool for workplace tasks.',
          'Work messages, errands, and other duties can continue into the evening. Keeping cannabis outside work time helps keep those responsibilities separate from personal time.',
          'This boundary means finishing work and travel duties before opening a bottle. The point is to keep the time and setting clear, not to promise a particular result.',
          'Cannabis should be used only when no further travel is required. Do not drive or operate machinery after THC use. Follow applicable product instructions and local requirements.',
          'The article''s main idea is simple: keep cannabis in private personal time after work and travel duties are complete.'
        ),
    jsonb_build_array(
          'Botanica places cannabis in private personal time.',
          'Finish work and travel duties before opening a bottle.',
          'Cannabis is not presented as a tool for workplace tasks.',
          'Do not drive or operate machinery after THC use.',
          'Follow applicable product instructions and local requirements.'
        ),
    'Botanica Editorial'
  ),
  (
    'tincture-or-edible-choosing-the-format-that-fits',
    'Tincture or Edible? Choosing the Format That Fits',
    'A Practical Framework for Comparing Liquid Drops and Familiar Fixed Portions',
    'Choosing between a tincture and an edible depends on how you prefer to approach your routine. Comparing liquid flexibility with familiar fixed portions helps identify the format that fits.',
    'Choosing between a liquid tincture and an edible comes down to personal preferences around visual flexibility, familiarity, and evening habits, with neither format being universally better.',
    jsonb_build_array(
          'When considering cannabis preparations, deciding between a liquid tincture and a solid edible is a practical decision. Both formats offer smoke-free ways to use cannabis during private personal time, yet each has distinct physical characteristics. Choosing between them is not a matter of determining which format is universally superior, but identifying which medium fits your personal preferences.',
          'Liquid tinctures provide a format based on visible liquid volume and administration options. Botanica tinctures use coconut MCT oil as the carrier. The unmarked dropper allows you to gauge your draw by eye -- using quarter, half, three-quarter, or full levels -- and provides the option to hold drops under the tongue or swallow them directly depending on the timing you prefer.',
          'Solid edibles, such as gummies or baked goods, provide pre-divided portions in a familiar food format. An edible requires no visual estimation or dropper handling; each piece is an individual unit that is chewed and swallowed. For those who prefer a pre-portioned solid format that moves directly into digestion, edibles offer straightforward handling.',
          'When considering which format to choose, think about how each fits into your evening space. A tincture involves handling a dropper bottle and gauging fluid levels by sight, which fits easily into an evening routine at home. An edible provides a pre-formed solid portion that requires no visual estimation. Both formats belong in safe, private home settings after work and travel obligations are finished.',
          'Neither format is universally better. The useful choice is the format whose characteristics better match your personal preferences and responsible-use routine.'
        ),
    jsonb_build_array(
          'Tinctures and edibles are distinct formats for smoke-free cannabis.',
          'Tinctures offer liquid volume adjustment and dual administration routes.',
          'Edibles offer pre-divided portions in a familiar solid format.',
          'The useful choice is the format whose characteristics better match your personal preferences and responsible-use routine.'
        ),
    'Apothecary Journal',
    'Tincture or Edible? Comparing Formats',
    'The practical differences between liquid drops and solid portions',
    'Tinctures and edibles are different product formats. This article compares liquid levels, dropper handling, and solid portions so readers can understand the difference without a promised outcome.',
    'A tincture and an edible have different formats and handling needs. The useful comparison is about those features, not a promised outcome.',
    jsonb_build_array(
          'A tincture and an edible are two different cannabis formats. A tincture is a liquid in a dropper bottle. An edible is a solid piece, such as a gummy or baked good.',
          'Botanica tinctures use coconut MCT oil as the carrier. The unmarked dropper lets you compare the liquid with quarter, half, three-quarter, and full visual levels. These levels are approximate.',
          'An edible comes as a pre-divided solid portion. It does not require a dropper or a visual liquid comparison. It is chewed and swallowed as food.',
          'A tincture can be held under the tongue or swallowed directly. An edible is swallowed as food. The two formats can have different timing, and personal timing can vary.',
          'Neither format is presented as universally better. This comparison is about the physical format, handling, and personal preferences around those features.'
        ),
    jsonb_build_array(
          'A tincture is a liquid in a bottle with an unmarked dropper.',
          'An edible is a solid piece in a familiar food format.',
          'Tincture visual levels are approximate.',
          'The two formats have different routes and timing.',
          'Neither format is presented as universally better.'
        ),
    'Botanica Editorial'
  );

do $$
declare
  v_missing_slugs text;
  v_edited_slugs text;
  v_known_count integer;
  v_updated_count integer;
begin
  select count(*) into v_known_count
  from public.articles as articles
  join phase_7a23_journal_payload as payload using (slug);

  if v_known_count <> 12 then
    select string_agg(payload.slug, ', ' order by payload.slug)
      into v_missing_slugs
    from phase_7a23_journal_payload as payload
    where not exists (
      select 1
      from public.articles as articles
      where articles.slug = payload.slug
    );

    raise exception
      'Phase 7A2.3 aborted: expected 12 known articles, found %. Missing slugs: %',
      v_known_count,
      coalesce(v_missing_slugs, '(count mismatch without a missing slug)');
  end if;

  select string_agg(articles.slug, ', ' order by articles.slug)
    into v_edited_slugs
  from public.articles as articles
  join phase_7a23_journal_payload as payload using (slug)
  where articles.title is distinct from payload.baseline_title
     or articles.subtitle is distinct from payload.baseline_subtitle
     or articles.excerpt is distinct from payload.baseline_excerpt
     or articles.thesis is distinct from payload.baseline_thesis
     or articles.content is distinct from payload.baseline_content
     or articles.key_takeaways is distinct from payload.baseline_key_takeaways
     or articles.author_role is distinct from payload.baseline_author_role;

  if v_edited_slugs is not null then
    raise exception
      'Phase 7A2.3 aborted: known article content differs from the pre-7A2.3 baseline. Review later admin edits before retrying. Slugs: %',
      v_edited_slugs;
  end if;

  update public.articles as articles
  set title = payload.next_title,
      subtitle = payload.next_subtitle,
      excerpt = payload.next_excerpt,
      thesis = payload.next_thesis,
      content = payload.next_content,
      key_takeaways = payload.next_key_takeaways,
      author_role = payload.next_author_role,
      updated_at = now()
  from phase_7a23_journal_payload as payload
  where articles.slug = payload.slug
    and articles.title is not distinct from payload.baseline_title
    and articles.subtitle is not distinct from payload.baseline_subtitle
    and articles.excerpt is not distinct from payload.baseline_excerpt
    and articles.thesis is not distinct from payload.baseline_thesis
    and articles.content is not distinct from payload.baseline_content
    and articles.key_takeaways is not distinct from payload.baseline_key_takeaways
    and articles.author_role is not distinct from payload.baseline_author_role;

  get diagnostics v_updated_count = row_count;
  if v_updated_count <> 12 then
    raise exception
      'Phase 7A2.3 aborted: expected to update 12 known articles, updated %.',
      v_updated_count;
  end if;
end $$;

commit;
